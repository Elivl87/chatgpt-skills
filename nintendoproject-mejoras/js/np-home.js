var NP = window.NP;
(function () {
  "use strict";
  var root = document.getElementById("npHome");
  if (!root || root.getAttribute("data-ready")) return;
  root.setAttribute("data-ready", "1");
  var U = NP.u("wp-content/uploads/");
  var URLS = {
    login: NP.u("mi-cuenta"),
    user: NP.u("mi-cuenta"),
    poke: NP.u("mi-pokemon"),
    plaza: NP.u("plaza-mii/"),
  };
  var AJAX =
    (window.NPPlaza && window.NPPlaza.ajax) ||
    (typeof window.npAjax === "string" && window.npAjax) ||
    "/wp-admin/admin-ajax.php";
  var RM =
    window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, ctx) {
    return (ctx || root).querySelector(s);
  }
  function $$(s, ctx) {
    return [].slice.call((ctx || root).querySelectorAll(s));
  }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }
  function num(n, d) {
    n = Number(n);
    return isFinite(n) ? n : d || 0;
  }
  function cap(s) {
    s = String(s || "");
    return s.charAt(0) + s.slice(1).toLowerCase();
  }
  function safeUrl(v) {
    try {
      var u = new URL(v, location.href);
      return /^https?:$/.test(u.protocol) ? u.href : "";
    } catch (e) {
      return "";
    }
  }
  function readJSON(k) {
    try {
      return JSON.parse(localStorage.getItem(k) || "null");
    } catch (e) {
      return null;
    }
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)),
        t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }
  window.NP_FONDOS = window.NP_FONDOS || {
    mario: {
      url: NP.u("wp-content/uploads/2026/05/FONDOPEACH.mp4"),
      label: "Mario",
      img: NP.u("wp-content/uploads/2026/02/975b574d5779b0bb4856b20c468b05ff2c0050ece8a57f1d91a799b999d7bde2.webp"),
      sub: "Castillo Peach",
    },
    zelda: {
      url: NP.u("wp-content/uploads/2025/11/zeldabackkkk.mp4"),
      label: "Zelda",
      img: NP.u("wp-content/uploads/2026/09/zelda2.webp"),
      sub: "Hyrule",
    },
    pokemon: {
      url: NP.u("wp-content/uploads/2025/12/pokemon-37-1.mp4"),
      label: "Pokémon",
      img: NP.u("wp-content/uploads/2026/09/ASHKETCHUIP.webp"),
      sub: "Kanto",
    },
    animal: {
      url: NP.u("wp-content/uploads/2026/07/cafe-1.mp4"),
      label: "Animal Crossing",
      img: NP.u("wp-content/uploads/2026/02/29419ee3e6b98083a8714f89b7730f09a96858eb7a88d99fff4875863ebd1df8.webp"),
      sub: "Cafetería",
    },
    donkey: {
      url: NP.u("wp-content/uploads/2026/09/DONKEYKONG2.mp4"),
      label: "Donkey Kong",
      img: NP.u("wp-content/uploads/2026/09/DKBc053.webp"),
      sub: "Isla DK",
    },
    kirby: {
      url: NP.u("wp-content/uploads/2026/09/KIRBY-1.mp4"),
      label: "Kirby",
      img: NP.u("wp-content/uploads/2026/02/5a258ea9d44361caadaf88344778fe9916bb995f337e91cf88d9a4896a0321fd.webp"),
      sub: "Dream Land",
    },
    metroid: {
      url: NP.u("wp-content/uploads/2026/09/PREVIEW-Metroid-Prime.mp4"),
      label: "Metroid",
      img: NP.u("wp-content/uploads/2026/09/MDc001.webp"),
      sub: "Tallon IV",
    },
    splatoon: {
      url: NP.u("wp-content/uploads/2026/09/descarga_11zon.webp"),
      label: "Splatoon",
      img: NP.u("wp-content/uploads/2026/02/4102b703dddd126db6fd3a9d6b9ed231421799154a5481e5b5e8ecb6404c2159.webp"),
      sub: "Inkópolis",
    },
    starfox: {
      url: NP.u("wp-content/uploads/2026/09/STARFOX.mp4"),
      label: "Star Fox",
      img: NP.u("wp-content/uploads/2026/09/SFc001.webp"),
      sub: "Corneria",
    },
    xenoblade: {
      url: NP.u("wp-content/uploads/2026/09/XENOBLADE.mp4"),
      label: "Xenoblade",
      img: NP.u("wp-content/uploads/2026/09/XC3c007.webp"),
      sub: "Aionios",
    },
    sonic: {
      url: NP.u("wp-content/uploads/2026/10/soniclive.mp4"),
      label: "Sonic",
      img: NP.u("wp-content/uploads/2026/10/sonic.png"),
      sub: "Green Hill",
    },
    playstation: {
      url: NP.u("wp-content/uploads/2025/11/PS2VIDEO.mp4"),
      label: "PlayStation",
      img: NP.u("wp-content/uploads/2026/09/ELLIE.webp"),
      sub: "Especial",
    },
  };
  var FONDOS = window.NP_FONDOS;
  if (FONDOS.mario)
    FONDOS.mario.url =
      NP.u("wp-content/uploads/2026/04/MARIOBUSCADOR.mp4");
  var MOBILE = window.matchMedia
    ? matchMedia("(max-width: 767px)")
    : { matches: !1 };
  var NETC = navigator.connection || {};
  var SAVE_DATA =
    NETC.saveData === !0 || /(^|-)2g$/.test(NETC.effectiveType || "");
  var REC = U + "2026/10/";
  var PREF_KEY = "np-widget-prefs";
  var PRESETS = [
    { id: "cyan", c1: "#1f8bff", c2: "#ff3b30" },
    { id: "blue", c1: "#0068d8", c2: "#48a6ff" },
    { id: "red", c1: "#e60012", c2: "#ff6b62" },
    { id: "green", c1: "#25E27F", c2: "#12B981" },
    { id: "yellow", c1: "#FFD23F", c2: "#FFE773" },
    { id: "pink", c1: "#FF5CA8", c2: "#FF8ACF" },
    { id: "purple", c1: "#9B6BFF", c2: "#C084FC" },
    { id: "orange", c1: "#FF7A2F", c2: "#FF9D4D" },
  ];
  var TEMA = {
    mario: "blue",
    zelda: "green",
    pokemon: "yellow",
    animal: "green",
    donkey: "orange",
    kirby: "pink",
    metroid: "orange",
    splatoon: "purple",
    starfox: "blue",
    xenoblade: "cyan",
    sonic: "blue",
    playstation: "blue",
  };
  var DEF = {
    theme: "dark",
    accent: "cyan",
    c1: "#1f8bff",
    c2: "#ff3b30",
    video: "mario",
    tiles: "md",
    bgVideo: !0,
    bgLevel: 80,
    sound: !0,
    anim: !0,
    showPoke: !0,
    showPlaza: !0,
  };
  function loadPrefs() {
    var p = readJSON(PREF_KEY),
      o = {},
      k;
    for (k in DEF) o[k] = DEF[k];
    if (p && typeof p === "object") for (k in p) o[k] = p[k];
    PRESETS.forEach(function (x) {
      if (x.id === o.accent) {
        o.c1 = x.c1;
        o.c2 = x.c2;
      }
    });
    if (!FONDOS[o.video]) o.video = "mario";
    return o;
  }
  var prefs = loadPrefs();
  window.npPrefs = prefs;
  function savePrefs() {
    window.npPrefs = prefs;
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    } catch (e) {}
  }
  var AV_TROFEOS = (window.NP_AV_TROFEOS = [
    [
      "#ff8ec2",
      "#ffc2dd",
      "adgadgashs|asdascfacas|adsadsdas|asdsad|dsadsa|dsd|KFLc077|dsfsv|PSPVd010|sdds-1|sddsds-1|xvdsds|vxcxvc|zxczxczx",
    ],
    [
      "#63c9ff",
      "#a2e8ff",
      "buho|bosdques|buhoss|lobito|minero|morritos|nieve-1|nieve3|oless|pato-1|pescaor|poerrito|reds|sdfsdf",
    ],
    [
      "#ffd54a",
      "#fff066",
      "cintyas|dfdsdfs|dssdgsbgs|dsdsfsd|fhdfhhd|fdhdh|fsdfdsfds|fhkfhkf|fsdgsdgsgs|jjj|sdffds|pikapasf|xfdhd|asadas",
    ],
    [
      "#ff4d4d",
      "#ff944d",
      "adgsdhbs|asassa|asdasd|assaas|asddsa|assasa|dsds|reyeyeye|dsdssd|sddsds|sdfsd|ysdudsiud|sdsdsdds|zxcczx",
    ],
    [
      "#7b5cff",
      "#b39dff",
      "assasa-1|dsfsdafv|dsdsds|S2c031|S3c221|S3c372|S3c373|sddsds-2|S3c374|sdsdsd|zcxczx|xzczxcas|zxcczxxzc|zxczxc",
    ],
    [
      "#00a86b",
      "#c9a93b",
      "cxzvasvas|dfdfsd|LZBWc005-1|LZBWc032|LZTKc011|LZTKc056|asdsadsadsa|LZBWc002-1|zelditasssdfsag|cxvxcvcxv|sdvsdbvsbv|xcvxcvxcv|dfsdfsdfsdfs|zelditass",
    ],
    [
      "#c9812f",
      "#e0a559",
      "111-1|DKBc019|DKBc044|dks|donkeykonf|donkldsdaf|dsdfcsacf|dsdfcsadcfv|dsfdfs|fdsdsfsaf|kongsgdsf|kongs|naranjas|sdfsdfsdfsadfv",
    ],
    [
      "#ff6a3d",
      "#ffa06a",
      "MDc007|MDc008|MDc009|MDc010|MDc018|MDc019|MDc020|MDc027|MDc028|MDc029|MP4Bc014|MP4Bc019|MPRc003|MPRc009",
    ],
  ]);
  var SAGA_AV = {
    kirby: { tr: 0 },
    animal: { tr: 1 },
    pokemon: { tr: 2 },
    mario: { tr: 3 },
    splatoon: { tr: 4 },
    zelda: { tr: 5 },
    donkey: { tr: 6 },
    metroid: { tr: 7 },
    starfox: { f: "2026/09", n: "SFc001|SFc002|SFc003|SFc004|SFc011" },
    xenoblade: {
      f: "2026/09",
      n: "XC3c008|XC3c001|XC3c007|XC3c033|XC3c038|XC3c191|XC3c192",
    },
    playstation: {
      f: "2026/09",
      n: "UNCHARTED|JOELMILLER|ELLIE|ALLOY|KRATOSS|CRASH|FANTASY",
    },
  };
  function trAv(tr, n) {
    return {
      u: U + "2026/09/" + n + ".webp",
      bg: "linear-gradient(135deg," + tr[0] + "," + tr[1] + ")",
      full: !0,
    };
  }
  function sagaAvatars(k) {
    var d = SAGA_AV[k];
    if (!d) return [];
    if (d.tr != null) {
      var tr = AV_TROFEOS[d.tr];
      return tr[2].split("|").map(function (n) {
        return trAv(tr, n);
      });
    }
    var g =
      "linear-gradient(135deg," +
      (colorOk(prefs.c1) ? prefs.c1 : "#1f8bff") +
      "," +
      (colorOk(prefs.c2) ? prefs.c2 : "#ff3b30") +
      ")";
    return d.n.split("|").map(function (n) {
      return { u: U + d.f + "/" + n + ".webp", bg: g, full: !1 };
    });
  }
  function randomAvatars(n) {
    var all = [];
    AV_TROFEOS.forEach(function (tr) {
      tr[2].split("|").forEach(function (nm) {
        all.push(trAv(tr, nm));
      });
    });
    return shuffle(all).slice(0, n);
  }
  function applySaga(k) {
    try {
      localStorage.setItem("np-saga", k);
    } catch (e) {}
    var list = SAGA_AV[k] ? sagaAvatars(k) : randomAvatars(12);
    window.NP_INTRO_AV = list;
    try {
      localStorage.setItem("np-intro-av", JSON.stringify(list.slice(0, 12)));
    } catch (e) {}
    if (!LOGGED)
      swapFade($("[data-me-av]"), function () {
        guestCarousel($("[data-me-av]"));
      });
    var sh = $("[data-plaza-show]");
    if (sh && sh.childElementCount)
      swapFade(sh, function () {
        sh.textContent = "";
        if (!sh.hidden) plazaShowcase();
      });
  }
  function swapFade(el, fn) {
    if (!el) return;
    if (root.getAttribute("data-anim") !== "on") {
      fn();
      return;
    }
    clearTimeout(el.__swap);
    el.classList.add("is-swapping");
    el.__swap = setTimeout(function () {
      fn();
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          el.classList.remove("is-swapping");
        });
      });
    }, 420);
  }
  window.NPSaga = {
    map: SAGA_AV,
    list: sagaAvatars,
    apply: function (k) {
      applySaga(k);
    },
  };
  window.NPHomePrefs = {
    fondos: FONDOS,
    presets: PRESETS,
    tema: TEMA,
    get: function () {
      return prefs;
    },
    set: function (patch) {
      for (var k in patch) prefs[k] = patch[k];
      savePrefs();
      applyPrefs();
      if (typeof markCfg === "function")
        try {
          markCfg();
        } catch (e) {}
    },
  };
  function hexRgb(h) {
    h = String(h).replace("#", "");
    if (h.length === 3) h = h.replace(/(.)/g, "$1$1");
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function lum(h) {
    var c = hexRgb(h).map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function mixHex(a, b) {
    var x = hexRgb(a),
      y = hexRgb(b);
    return (
      "#" +
      [0, 1, 2]
        .map(function (i) {
          return ("0" + Math.round((x[i] + y[i]) / 2).toString(16)).slice(-2);
        })
        .join("")
    );
  }
  function bgApply() {
    var v = Number(prefs.bgLevel);
    if (!isFinite(v)) v = 80;
    v = clamp(v, 0, 100) / 100;
    var top = Math.max(0, (v - 0.8) / 0.2);
    var st = root.style;
    st.setProperty(
      "--nph-bg-bright",
      (0.06 + 0.94 * v + (1 - (0.06 + 0.94 * v)) * top).toFixed(3),
    );
    st.setProperty("--nph-bg-sat", (0.88 + 0.12 * top).toFixed(3));
    st.setProperty("--nph-scrim-o", (1 - 0.65 * top).toFixed(3));
  }
  function applyPrefs() {
    root.setAttribute("data-theme", prefs.theme === "light" ? "light" : "dark");
    root.setAttribute("data-anim", prefs.anim === !1 || RM ? "off" : "on");
    root.setAttribute("data-accent", prefs.accent || "cyan");
    root.setAttribute("data-video", prefs.video || "mario");
    root.classList.toggle("no-poke", prefs.showPoke === !1);
    root.classList.toggle("no-plaza", prefs.showPlaza === !1);
    if (typeof startPlaza === "function") startPlaza();
    if (typeof startPoke === "function" && pokeBoot) startPoke();
    if (typeof slReset === "function" && pokeBoot) slReset();
    scheduleFit();
    bgApply();
    var mid = prefs.accent === "cyan" ? "#ff8a80" : mixHex(prefs.c1, prefs.c2);
    [
      ["--a1", prefs.c1],
      ["--a2", prefs.c2],
      ["--amid", mid],
      ["--np-accent-1", prefs.c1],
      ["--np-accent-2", prefs.c2],
      ["--np-accent-mid", mid],
    ].forEach(function (v) {
      root.style.setProperty(v[0], v[1]);
    });
    root.style.setProperty(
      "--a-tx",
      (lum(prefs.c1) + lum(prefs.c2)) / 2 > 0.5 ? "#16181d" : "#fff",
    );
    applyBg();
  }
  var bgVid = $(".nph-bg-video"),
    bgImg = $(".nph-bg-img"),
    visible = !1;
  bgVid.muted = !0;
  bgVid.defaultMuted = !0;
  bgVid.setAttribute("muted", "");
  bgVid.setAttribute("playsinline", "");
  bgVid.autoplay = !0;
  window.NPHomeBg = {
    play: function () {
      visible = !0;
      applyBg();
    },
  };
  function isImg(u) {
    return /\.(webp|png|jpe?g|gif|avif)(\?.*)?$/i.test(u || "");
  }
  var BG_FADE = 1400,
    imgUnload = 0,
    vidUnload = 0;
  function newVideo() {
    var v = document.createElement("video");
    v.className = "nph-bg-video";
    v.muted = !0;
    v.defaultMuted = !0;
    v.loop = !0;
    v.autoplay = !0;
    v.preload = "auto";
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("aria-hidden", "true");
    return v;
  }
  function dropLater(el, isVid) {
    setTimeout(function () {
      if (el === bgVid || el === bgImg) return;
      if (isVid) {
        try {
          el.pause();
        } catch (e) {}
        el.removeAttribute("src");
        try {
          el.load();
        } catch (e) {}
      }
      if (el.parentNode) el.parentNode.removeChild(el);
    }, BG_FADE);
  }
  function showImg(src, done) {
    if (bgImg.getAttribute("src") === src) {
      bgImg.classList.add("on");
      if (done) done();
      return;
    }
    var old = bgImg,
      im = document.createElement("img");
    im.className = "nph-bg-img";
    im.alt = "";
    im.decoding = "async";
    old.parentNode.insertBefore(im, old.nextSibling);
    bgImg = im;
    im.onload = function () {
      im.onload = null;
      requestAnimationFrame(function () {
        im.classList.add("on");
      });
      if (old.getAttribute("src")) dropLater(old, !1);
      else if (old.parentNode) old.parentNode.removeChild(old);
      if (done) setTimeout(done, BG_FADE);
    };
    im.src = src;
  }
  function showVideo(url) {
    var old = bgVid,
      wasOn = old.classList.contains("on") && old.getAttribute("src");
    [].forEach.call(old.parentNode.querySelectorAll("video"), function (v) {
      if (v !== old && !v.classList.contains("on")) {
        v.removeAttribute("src");
        v.parentNode.removeChild(v);
      }
    });
    var v = wasOn ? newVideo() : old;
    if (wasOn) {
      old.parentNode.insertBefore(v, old.nextSibling);
      bgVid = v;
    }
    v.classList.remove("on");
    v.oncanplay = function () {
      v.oncanplay = null;
      requestAnimationFrame(function () {
        v.classList.add("on");
      });
      if (wasOn) dropLater(old, !0);
    };
    v.src = url;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  function applyBg() {
    if (window.NPHomeBgHold) return;
    var f = FONDOS[prefs.video] || FONDOS.mario;
    if (isImg(f.url) || SAVE_DATA) {
      showImg(isImg(f.url) ? f.url : f.img, function () {
        var nowImg =
          FONDOS[prefs.video] && (isImg(FONDOS[prefs.video].url) || SAVE_DATA);
        if (!nowImg) return;
        bgVid.classList.remove("on");
        clearTimeout(vidUnload);
        vidUnload = setTimeout(function () {
          if (bgVid.classList.contains("on")) return;
          try {
            bgVid.pause();
          } catch (e) {}
          if (bgVid.getAttribute("src")) {
            bgVid.removeAttribute("src");
            try {
              bgVid.load();
            } catch (e) {}
          }
        }, BG_FADE);
      });
      return;
    }
    if (!visible) {
      bgImg.classList.remove("on");
      return;
    }
    clearTimeout(vidUnload);
    if (bgVid.getAttribute("src") !== f.url) {
      showVideo(f.url);
      clearTimeout(imgUnload);
      imgUnload = setTimeout(function () {
        if (bgVid.classList.contains("on")) bgImg.classList.remove("on");
      }, 200);
      var waitImg = setInterval(function () {
        if (bgVid.classList.contains("on")) {
          bgImg.classList.remove("on");
          clearInterval(waitImg);
        }
      }, 120);
      setTimeout(function () {
        clearInterval(waitImg);
        bgImg.classList.remove("on");
      }, 6000);
    } else {
      bgImg.classList.remove("on");
      var p = bgVid.play();
      if (p && p.catch) p.catch(function () {});
    }
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      function (en) {
        visible = en[0].isIntersecting;
        root.classList.toggle("is-off", !visible);
        if (visible) {
          applyBg();
          reveal();
          if (plazaOn && PL) wakePlaza();
        } else {
          try {
            bgVid.pause();
          } catch (e) {}
        }
      },
      { threshold: 0.05 },
    ).observe(root);
  } else {
    visible = !0;
    reveal();
  }
  var entered = !1;
  function reveal() {
    if (document.documentElement.classList.contains("nsw-cover")) return;
    root.classList.add("is-in");
    if (entered) return;
    entered = !0;
    if (root.getAttribute("data-anim") !== "on") return;
    root.classList.add("nph-entering");
    setTimeout(function () {
      root.classList.remove("nph-entering");
    }, 2600);
    entrySound();
  }
  var AC = null;
  function entrySound() {
    if (prefs.sound === !1) return;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      AC = AC || new Ctx();
    } catch (e) {
      return;
    }
    var go = function () {
      if (AC.state !== "running") return;
      var out = AC.createGain();
      out.gain.value = 0.45;
      out.connect(AC.destination);
      var t0 = AC.currentTime + 0.05;
      function tone(f, t, d, v, type, f2) {
        var o = AC.createOscillator(),
          g = AC.createGain();
        o.type = type || "sine";
        o.frequency.setValueAtTime(f, t);
        if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(v, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g);
        g.connect(out);
        o.start(t);
        o.stop(t + d + 0.05);
      }
      function whoosh(t, from, to) {
        var len = Math.floor(AC.sampleRate * 0.45),
          buf = AC.createBuffer(1, len, AC.sampleRate),
          d = buf.getChannelData(0);
        for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        var src = AC.createBufferSource(),
          bp = AC.createBiquadFilter(),
          g = AC.createGain();
        src.buffer = buf;
        bp.type = "bandpass";
        bp.Q.value = 0.8;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + 0.4);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.16, t + 0.12);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
        src.connect(bp);
        bp.connect(g);
        g.connect(out);
        src.start(t);
        src.stop(t + 0.45);
      }
      whoosh(t0 + 0.1, 600, 3200);
      tone(523.25, t0 + 0.55, 0.35, 0.16, "triangle");
      tone(659.25, t0 + 0.62, 0.35, 0.14, "triangle");
      whoosh(t0 + 0.3, 700, 3600);
      tone(783.99, t0 + 0.78, 0.4, 0.14, "triangle");
      tone(1046.5, t0 + 0.86, 0.6, 0.12, "sine");
      tone(1318.5, t0 + 0.94, 0.7, 0.08, "sine");
    };
    if (AC.state === "suspended") {
      try {
        var r = AC.resume();
        if (r && r.then) r.then(go, function () {});
        else go();
      } catch (e) {}
    } else go();
  }
  addEventListener("np-welcome-done", function () {
    if (visible) {
      reveal();
      applyBg();
    }
    if (!LOGGED) guestCarousel($("[data-me-av]"));
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      try {
        bgVid.pause();
      } catch (e) {}
    } else if (visible) applyBg();
  });
  function headerNav() {
    return (
      document.getElementById("np-nav") ||
      document.querySelector("body > header, .elementor-location-header")
    );
  }
  function docTop(n) {
    var t = 0;
    while (n) {
      t += n.offsetTop;
      n = n.offsetParent;
    }
    return t;
  }
  var lastHead = 0;
  function measureHead() {
    var nav = headerNav();
    if (!nav) return;
    var cs = getComputedStyle(nav),
      pos = cs.position,
      gap = 0;
    if (cs.display === "none") return;
    if (pos === "fixed" || pos === "absolute") {
      var h = nav.offsetHeight;
      if (!h) return;
      var top =
        pos === "fixed"
          ? (isFinite(parseFloat(cs.top)) ? parseFloat(cs.top) : 0) +
            (parseFloat(cs.marginTop) || 0)
          : docTop(nav);
      gap = Math.max(0, Math.round(top + h - docTop(root)));
      if (gap > 320) gap = lastHead;
    }
    if (!gap && lastHead && (pos === "fixed" || pos === "absolute"))
      gap = lastHead;
    lastHead = gap;
    if (root.style.getPropertyValue("--nph-head") !== gap + "px")
      root.style.setProperty("--nph-head", gap + "px");
    if (typeof scheduleFit === "function") scheduleFit();
  }
  measureHead();
  addEventListener("load", measureHead);
  [300, 1000, 2500, 5000].forEach(function (t) {
    setTimeout(measureHead, t);
  });
  addEventListener("np-welcome-done", function () {
    setTimeout(measureHead, 50);
    setTimeout(measureHead, 2300);
  });
  (function () {
    var nav = headerNav();
    if (!nav || !window.MutationObserver) return;
    var t = 0;
    new MutationObserver(function () {
      clearTimeout(t);
      t = setTimeout(measureHead, 120);
    }).observe(nav, { attributes: !0, attributeFilter: ["class", "style"] });
  })();
  var fitEl = $(".nph-fit"),
    fitRaf = 0;
  var innerEl = $(".nph-inner");
  function setPx(v) {
    if (root.style.getPropertyValue("--px") !== v)
      root.style.setProperty("--px", v);
  }
  function fit() {
    fitRaf = 0;
    if (innerWidth <= 1180) {
      setPx("1px");
      return;
    }
    var cur = parseFloat(root.style.getPropertyValue("--px")) || 1;
    var natH = (fitEl.offsetHeight || 700) / cur;
    var head = parseFloat(root.style.getPropertyValue("--nph-head")) || 0;
    var availW = innerEl.clientWidth - 68;
    var availH = Math.max(480, innerHeight - 16 - head - 54);
    var k = clamp(Math.min(availW / 1240, availH / natH), 0.62, 1.6);
    if (Math.abs(k - cur) > 0.008) setPx(k.toFixed(3) + "px");
  }
  function scheduleFit() {
    if (!fitRaf) fitRaf = requestAnimationFrame(fit);
  }
  addEventListener("load", scheduleFit);
  addEventListener("resize", scheduleFit, { passive: !0 });
  addEventListener("np-welcome-done", scheduleFit);
  try {
    document.fonts.ready.then(scheduleFit);
  } catch (e) {}
  addEventListener(
    "resize",
    function () {
      clearTimeout(measureHead.t);
      measureHead.t = setTimeout(measureHead, 150);
    },
    { passive: !0 },
  );
  var SFX = {
      click: U + "2025/07/CLICK.mp3",
      enter: U + "2025/07/Enter-_-Back.mp3",
      ajustes: U + "2026/07/ajustes.mp3",
      poke: U + "2026/09/uplevel.mp3",
      plaza: U + "2026/10/01-Home-Menu-Banner.mp3",
    },
    sfxCache = {};
  function sfx(k, vol) {
    if (prefs.sound === !1) return;
    try {
      var a = sfxCache[k] || (sfxCache[k] = new Audio(SFX[k]));
      a.volume = vol || 0.4;
      a.currentTime = 0;
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }
  var fTime = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
  function tick() {
    var d = new Date();
    $("[data-clock]").textContent = fTime.format(d);
    var h = d.getHours();
    $("[data-greet-time]").textContent =
      h < 6
        ? "Buenas noches"
        : h < 14
          ? "Buenos días"
          : h < 21
            ? "Buenas tardes"
            : "Buenas noches";
  }
  tick();
  setInterval(tick, 20000);
  var NP_TROFEOS =
    /\/uploads\/2026\/09\/(adgsdhbs|asassa|asdasd|assaas|asddsa|assasa|dsds|reyeyeye|dsdssd|sddsds|sdfsd|ysdudsiud|sdsdsdds|zxcczx|cintyas|dfdsdfs|dssdgsbgs|dsdsfsd|fhdfhhd|fdhdh|fsdfdsfds|fhkfhkf|fsdgsdgsgs|jjj|sdffds|pikapasf|xfdhd|asadas|buho|bosdques|buhoss|lobito|minero|morritos|nieve-1|nieve3|oless|pato-1|pescaor|poerrito|reds|sdfsdf|adgadgashs|asdascfacas|adsadsdas|asdsad|dsadsa|dsd|KFLc077|dsfsv|PSPVd010|sdds-1|sddsds-1|xvdsds|vxcxvc|zxczxczx|111-1|DKBc019|DKBc044|dks|donkeykonf|donkldsdaf|dsdfcsacf|dsdfcsadcfv|dsfdfs|fdsdsfsaf|kongsgdsf|kongs|naranjas|sdfsdfsdfsadfv|MDc007|MDc008|MDc009|MDc010|MDc018|MDc019|MDc020|MDc027|MDc028|MDc029|MP4Bc014|MP4Bc019|MPRc003|MPRc009|assasa-1|dsfsdafv|dsdsds|S2c031|S3c221|S3c372|S3c373|sddsds-2|S3c374|sdsdsd|zcxczx|xzczxcas|zxcczxxzc|zxczxc|cxzvasvas|dfdfsd|LZBWc005-1|LZBWc032|LZTKc011|LZTKc056|asdsadsadsa|LZBWc002-1|zelditasssdfsag|cxvxcvcxv|sdvsdbvsbv|xcvxcvxcv|dfsdfsdfsdfs|zelditass)\.(webp|png|jpe?g|gif)(\?|$)/;
  var DEFAULT_AV =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="38" r="19" fill="#fff" fill-opacity=".92"/><path d="M14 100c2-22 17-34 36-34s34 12 36 34z" fill="#fff" fill-opacity=".92"/></svg>',
    );
  var GUEST = [
    { u: U + "2026/02/POK2.webp", c: "#FFD630" },
    {
      u:
        U +
        "2026/02/975b574d5779b0bb4856b20c468b05ff2c0050ece8a57f1d91a799b999d7bde2.webp",
      c: "#E53935",
    },
    {
      u:
        U +
        "2026/02/761c6be8ebcd9d655a1d4ee058e2d1cc4bc0d5da9f0cdbaf11a395c8b7567bc3.webp",
      c: "#4A90FF",
    },
    {
      u:
        U +
        "2026/02/5a258ea9d44361caadaf88344778fe9916bb995f337e91cf88d9a4896a0321fd.webp",
      c: "#FF6B9D",
    },
  ];
  function guestList() {
    var l = window.NP_INTRO_AV || readJSON("np-intro-av");
    if (Array.isArray(l)) {
      l = l
        .filter(function (a) {
          return a && safeUrl(a.u);
        })
        .slice(0, 12);
      if (l.length >= 1) return l;
    }
    return GUEST;
  }
  var GC = { box: null, items: [], cur: 0, timer: 0, key: "" };
  function guestCarousel(box) {
    var list = guestList(),
      key = list
        .map(function (a) {
          return a.u;
        })
        .join("|");
    if (box.getAttribute("data-guest") === key) return;
    box.setAttribute("data-guest", key);
    box.textContent = "";
    box.classList.remove("full");
    box.style.backgroundColor = "transparent";
    box.style.backgroundImage = "none";
    var items = list.map(function (a, i) {
      var sp = el("span", "nph-big" + (a.full ? " is-full" : ""));
      if (a.bg && gradOk(a.bg)) sp.style.backgroundImage = a.bg;
      if (a.c && colorOk(a.c)) sp.style.backgroundColor = a.c;
      var im = el("img");
      im.alt = "";
      im.decoding = "async";
      if (i > 1) im.loading = "lazy";
      im.src = safeUrl(a.u);
      im.onerror = function () {
        im.onerror = null;
        im.src = DEFAULT_AV;
      };
      sp.appendChild(im);
      box.appendChild(sp);
      return sp;
    });
    items[0].classList.add("on");
    GC.box = box;
    GC.items = items;
    GC.cur = 0;
    if (!GC.timer)
      GC.timer = setInterval(function () {
        if (
          document.hidden ||
          !visible ||
          GC.items.length < 2 ||
          !GC.box.isConnected ||
          !GC.box.getAttribute("data-guest")
        )
          return;
        var prev = GC.items[GC.cur];
        prev.classList.remove("on");
        prev.classList.add("off");
        setTimeout(function () {
          prev.classList.remove("off");
        }, 450);
        GC.cur = (GC.cur + 1) % GC.items.length;
        GC.items[GC.cur].classList.remove("off");
        GC.items[GC.cur].classList.add("on");
      }, 2000);
  }
  var FONDOS_MII = {
    "#3b82f6": "linear-gradient(135deg,#7ce7ff 0%,#3b82f6 52%,#4338ca 100%)",
    "#ef4444": "linear-gradient(135deg,#ffb08b 0%,#ff625b 48%,#d92558 100%)",
    "#facc15": "linear-gradient(135deg,#fff1a8 0%,#ffd34e 48%,#f28a29 100%)",
    "#10b981": "linear-gradient(135deg,#a4f7c4 0%,#2bd4ac 48%,#087f94 100%)",
    "#8b5cf6": "linear-gradient(135deg,#e0b8ff 0%,#a078f5 48%,#5552c9 100%)",
    "#ec4899": "linear-gradient(135deg,#ffd0b8 0%,#f58bb9 48%,#c9429d 100%)",
  };
  function gradOk(b) {
    return (
      typeof b === "string" &&
      b.length <= 260 &&
      /^linear-gradient\([0-9a-z#%,.\s()\-]+\)$/i.test(b)
    );
  }
  function colorOk(c) {
    return (
      typeof c === "string" &&
      (/^#[0-9a-f]{3,8}$/i.test(c) || /^rgba?\([\d\s.,%]+\)$/i.test(c))
    );
  }
  function paintAv(box, p) {
    if (!box) return;
    p = p || {};
    box.removeAttribute("data-guest");
    var img = box.querySelector(":scope > img");
    if (!img || box.querySelector(".nph-big")) {
      box.textContent = "";
      img = el("img");
      img.alt = "";
      img.decoding = "async";
      box.appendChild(img);
    }
    var src = safeUrl(p.avatar) || DEFAULT_AV;
    var full = !!(
      p.full === !0 ||
      p.full === 1 ||
      p.full === "1" ||
      NP_TROFEOS.test(src)
    );
    box.classList.toggle("full", full);
    box.style.backgroundColor = full
      ? "transparent"
      : colorOk(p.color)
        ? p.color
        : "#3b82f6";
    box.style.backgroundImage = full
      ? "none"
      : gradOk(p.background)
        ? p.background
        : FONDOS_MII[String(p.color || "").toLowerCase()] || "none";
    if (img.getAttribute("src") !== src) {
      img.onerror = function () {
        img.onerror = null;
        img.src = DEFAULT_AV;
      };
      img.src = src;
    }
  }
  var USER = window.npUserAvatar || {};
  var LOGGED = !!USER.loggedIn;
  function myProfile() {
    if (!LOGGED) return null;
    var p = readJSON("mii-perfil"),
      norm = function (x) {
        return String(x == null ? "" : x)
          .trim()
          .toLowerCase();
      };
    if (p && p.avatar) {
      var cands = [USER.login, USER.name, window.NP_USUARIO]
        .map(norm)
        .filter(Boolean);
      var owner = norm(p.usuario || p.apodo);
      if ((!cands.length && p.isCustom) || cands.indexOf(owner) !== -1) {
        return {
          avatar: p.avatar,
          color: p.color || USER.color,
          background: p.background || "",
          full: p.full,
          name: USER.name || p.apodo || "",
        };
      }
    }
    return {
      avatar: USER.avatar || DEFAULT_AV,
      color: USER.color || "#3b82f6",
      background: "",
      full: !1,
      name: USER.name || USER.login || "",
    };
  }
  var RANGOS = [
    {
      min: 1,
      nombre: "Joven Promesa",
      a: "#43c943",
      b: "#b6f28c",
      icono: U + "2026/09/jovenpromesayoshi.webp",
    },
    {
      min: 5,
      nombre: "Toad Novato",
      a: "#ff6b6b",
      b: "#ffd6d6",
      icono: U + "2026/09/icontoad.webp",
    },
    {
      min: 10,
      nombre: "Devorador de Estrellas",
      a: "#ff8ec2",
      b: "#ffc2dd",
      icono: U + "2026/09/projectsskirbyss.webp",
    },
    {
      min: 15,
      nombre: "Cazador de Estrellas",
      a: "#ffd54a",
      b: "#ffb13b",
      icono: U + "2026/09/Star-icon.png",
    },
    {
      min: 20,
      nombre: "Vecino Ejemplar de la Isla",
      a: "#86efac",
      b: "#10b981",
      icono: U + "2026/09/ANML.webp",
    },
    {
      min: 25,
      nombre: "Comandante Pikmin",
      a: "#ff5a5a",
      b: "#4d8dff",
      icono: U + "2026/09/Pc049-1.webp",
    },
    {
      min: 30,
      nombre: "Entrenador Pokémon",
      a: "#ffd54a",
      b: "#ff4d4d",
      icono: U + "2026/09/charitrofeo.webp",
    },
    {
      min: 35,
      nombre: "Líder de Gimnasio",
      a: "#f59e0b",
      b: "#fde047",
      icono: U + "2026/09/pokebadge.webp",
    },
    {
      min: 40,
      nombre: "Capitán de la Flota Toad",
      a: "#3b82f6",
      b: "#ff6b6b",
      icono: U + "2026/09/toadcapi.png",
    },
    {
      min: 45,
      nombre: "Héroe del Reino Champiñón",
      a: "#ff4d4d",
      b: "#ff944d",
      icono: U + "2026/09/mario-trofeo.webp",
    },
    {
      min: 50,
      nombre: "Comandante Bowser",
      a: "#ff7a00",
      b: "#dc2626",
      icono: U + "2026/08/ALERTABOWSER.webp",
    },
    {
      min: 55,
      nombre: "Graffitero Novato",
      a: "#facc15",
      b: "#8b5cf6",
      icono: U + "2026/09/S3c010.webp",
    },
    {
      min: 60,
      nombre: "Calamar de Élite",
      a: "#ff3d9a",
      b: "#a0e60a",
      icono: U + "2026/09/splatoon-trofeo.webp",
    },
    {
      min: 65,
      nombre: "Piloto de 200cc",
      a: "#ef4444",
      b: "#facc15",
      icono: U + "2026/09/piloto.webp",
    },
    {
      min: 70,
      nombre: "Rey Ganondorf",
      a: "#b91c1c",
      b: "#f5c542",
      icono: U + "2026/09/SSBU_Ganondorf_Stock.webp",
    },
    {
      min: 75,
      nombre: "Héroe de Hyrule",
      a: "#00a86b",
      b: "#c9a93b",
      icono: U + "2026/09/zelda-trofeo.webp",
    },
    {
      min: 80,
      nombre: "Guardián de la Trifuerza",
      a: "#f9df7b",
      b: "#b8860b",
      icono: U + "2026/09/icons8-trifuerza-96.png",
    },
    {
      min: 85,
      nombre: "Leyenda del Torneo Smash",
      a: "#f43f5e",
      b: "#8b5cf6",
      icono: U + "2026/09/smash.png",
    },
    {
      min: 90,
      nombre: "Rey de la Jungla Kong",
      a: "#c9812f",
      b: "#e0a559",
      icono: U + "2026/09/donkey-trofeo.webp",
    },
    {
      min: 95,
      nombre: "Cazarrecompensas de Élite",
      a: "#ff6a3d",
      b: "#22d3ee",
      icono: U + "2026/09/samus-1.webp",
    },
    {
      min: 100,
      nombre: "Leyenda de Nintendo Project",
      a: "#10b981",
      b: "#8b5cf6",
      icono: U + "2026/09/samus-trofeo.webp",
    },
  ];
  var STAR_IMG = U + "2026/09/Star-icon.png";
  function rangoDe(n) {
    var r = RANGOS[0];
    for (var i = 0; i < RANGOS.length; i++)
      if (n >= RANGOS[i].min) r = RANGOS[i];
    return r;
  }
  function paintRank(n) {
    var rk = rangoDe(n),
      img = $("[data-rank-img]");
    $("[data-rank-name]").textContent = rk.nombre;
    img.onerror = function () {
      img.onerror = null;
      img.src = STAR_IMG;
    };
    if (img.getAttribute("src") !== rk.icono) img.src = rk.icono;
  }
  var ME = null;
  var fLong = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  function renderMe() {
    var me = (ME = myProfile());
    var name = me ? me.name || "Mii" : "Invitado";
    var avBox = $("[data-me-av]");
    if (me) paintAv(avBox, me);
    else guestCarousel(avBox);
    $("[data-prof-name]").textContent = name;
    $("[data-prof-name]").hidden = !me;
    $("[data-greet]").textContent = me
      ? "¡Hola, " + name + "!"
      : "¡Hola, invitado!";
    var cta = $("[data-prof-cta]");
    window.NPHomeData = { me: null, nivel: 0, fallback: DEFAULT_AV };
    if (!me) {
      $("[data-lv]").hidden = !0;
      var sub = $("[data-prof-sub]");
      sub.textContent = "";
      sub.appendChild(el("span", "nph-join", "Inicia Sesión"));
      sub.classList.add("is-guest");
      $("[data-prof-sub]").classList.remove("is-since");
      $("[data-rank]").hidden = !0;
      cta.href = URLS.login;
      cta.textContent = "Entrar o Crear Cuenta";
      return;
    }
    var nv = { nivel: 1, dias: 1, primerDia: "" };
    try {
      if (window.NPNivel)
        nv = window.NPNivel.registrar(USER.login || USER.name || "");
      if (window.NPHeader && typeof window.NPHeader.nivel === "function")
        nv.nivel = window.NPHeader.nivel() || nv.nivel;
    } catch (e) {}
    var max = (window.NPNivel && window.NPNivel.MAX) || 100;
    var lv = $("[data-lv]");
    lv.hidden = !1;
    lv.textContent = "Nivel " + nv.nivel;
    $("[data-rank]").hidden = !1;
    paintRank(clamp(Math.floor(num(nv.nivel, 1)), 1, max));
    var since = "";
    if (nv.primerDia) {
      var pd = nv.primerDia.split("-");
      since =
        "Contigo desde el " +
        fLong.format(new Date(+pd[0], +pd[1] - 1, +pd[2]));
    }
    $("[data-prof-sub]").classList.remove("is-guest");
    $("[data-prof-sub]").textContent = since || "Miembro de Nintendo Project";
    $("[data-prof-sub]").classList.add("is-since");
    cta.href = URLS.user;
    cta.textContent = "Ver Mi Cuenta";
    var avSrc = safeUrl(me.avatar) || DEFAULT_AV;
    window.NPHomeData = {
      me: {
        name: name,
        avatar: avSrc,
        color: colorOk(me.color) ? me.color : "#3b82f6",
        bg: gradOk(me.background)
          ? me.background
          : FONDOS_MII[String(me.color || "").toLowerCase()] || "",
        isFull: !!(
          me.full === !0 ||
          me.full === 1 ||
          me.full === "1" ||
          NP_TROFEOS.test(avSrc)
        ),
      },
      nivel: nv.nivel,
      fallback: DEFAULT_AV,
    };
  }
  window.NPSexo =
    window.NPSexo ||
    (function () {
      var M = [
        "ashPikachu",
        "lgLatios",
        "lgTornadus",
        "lgThundurus",
        "lgLandorus",
        "lgOkidogi",
        "lgMunkidori",
        "lgFezandipiti",
      ];
      var F = ["lgLatias", "lgCresselia", "lgEnamorus", "lgOgerpon"];
      var R = ["lgHeatran", "lgTerapagos"];
      function rule(key) {
        key = String(key || "");
        if (M.indexOf(key) >= 0) return "m";
        if (F.indexOf(key) >= 0) return "f";
        if (
          key === "darkraiShiny" ||
          (/^lg[A-Z]/.test(key) && R.indexOf(key) < 0)
        )
          return "none";
        return "";
      }
      function roll(key, start) {
        var s = String(key || "") + "|" + String(start || ""),
          h = 2166136261;
        for (var i = 0; i < s.length; i++) {
          h ^= s.charCodeAt(i);
          h = Math.imul(h, 16777619);
        }
        h ^= h >>> 16;
        h = Math.imul(h, 0x45d9f3b);
        h ^= h >>> 16;
        return (h >>> 0) % 2 ? "f" : "m";
      }
      function of(st) {
        if (!st || typeof st !== "object" || !st.key) return "none";
        var r = rule(st.key);
        if (r) return r;
        if (st.sexo === "m" || st.sexo === "f") return st.sexo;
        var c = st.card;
        if (c && (c.gender === "m" || c.gender === "f")) return c.gender;
        return roll(st.key, st.start);
      }
      function fix(st) {
        if (!st || typeof st !== "object" || !st.key) return !1;
        var g = of(st);
        if (g === "none") {
          if (st.sexo != null) {
            delete st.sexo;
            return !0;
          }
          return !1;
        }
        if (st.sexo !== g) {
          st.sexo = g;
          return !0;
        }
        return !1;
      }
      function fixAll(S) {
        var ch = fix(S),
          t = S && S.team;
        if (t && typeof t === "object") {
          [t.bench, t.legends].forEach(function (list) {
            if (Array.isArray(list))
              list.forEach(function (m) {
                if (fix(m)) ch = !0;
              });
          });
          if (t.legend && fix(t.legend)) ch = !0;
        }
        return ch;
      }
      function find(S, key) {
        if (!S || typeof S !== "object") return null;
        if (S.key === key) return S;
        var t = S.team || {},
          lists = [t.bench, t.legends, t.legend ? [t.legend] : null];
        for (var i = 0; i < lists.length; i++) {
          var l = lists[i];
          if (!Array.isArray(l)) continue;
          for (var j = 0; j < l.length; j++)
            if (l[j] && l[j].key === key) return l[j];
        }
        return null;
      }
      function symbol(g) {
        return g === "m" ? "♂" : g === "f" ? "♀" : "";
      }
      function label(g) {
        return g === "m" ? "Macho" : g === "f" ? "Hembra" : "Sin sexo";
      }
      return {
        version: 1,
        of: of,
        fix: fix,
        fixAll: fixAll,
        find: find,
        rule: rule,
        symbol: symbol,
        label: label,
      };
    })();
  var SEX_SVG = {
    m: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10" cy="14" r="6" fill="none" stroke="currentColor" stroke-width="3"/><path d="M14.5 9.5 20 4M14.5 4H20v5.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    f: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="9" r="6" fill="none" stroke="currentColor" stroke-width="3"/><path d="M12 15v7M8.5 18.5h7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  };
  function paintSex(S) {
    var b = $("[data-poke-sex]");
    if (!b) return;
    var g = S ? window.NPSexo.of(S) : "none",
      has = g === "m" || g === "f";
    if (b.getAttribute("data-sex") !== g) {
      b.setAttribute("data-sex", g);
      b.innerHTML = has ? SEX_SVG[g] : "";
    }
    b.hidden = !has;
    b.title = has ? (g === "m" ? "Macho" : "Hembra") : "";
    b.setAttribute("aria-label", b.title);
  }
  var BASE = U + "2026/03/";
  var PK = {
    rioluShiny: {
      dex: "#447",
      gen: "IV",
      region: "SINNOH",
      name: "RIOLU SHINY",
      profile: "rioluShiny",
      special: "riolu",
      friendshipEvolution: !0,
      ability: "Foco interno",
      types: ["LUCHA"],
      s: NP.u("wp-content/uploads/2026/09/riolushiny.gif"),
      evo: [
        {
          n: "RIOLU SHINY",
          d: 0,
          dex: "#447",
          types: ["LUCHA"],
          s: NP.u("wp-content/uploads/2026/09/riolushiny.gif"),
        },
        {
          n: "LUCARIO",
          d: 21,
          dex: "#448",
          types: ["LUCHA", "ACERO"],
          s: NP.u("wp-content/uploads/2026/09/lucariogrande.gif"),
        },
      ],
    },
    ashPikachu: {
      dex: "#025",
      gen: "I",
      region: "KANTO",
      name: "PIKACHU DE ASH",
      profile: "ashPikachu",
      types: ["ELECTRICO"],
      s: NP.u("wp-content/uploads/2026/09/pikapi.gif"),
      evo: [
        {
          n: "PIKACHU DE ASH",
          d: 0,
          s: NP.u("wp-content/uploads/2026/09/pikapi.gif"),
        },
        {
          n: "PIKACHU DE ASH",
          d: 101,
          s: NP.u("wp-content/uploads/2026/09/pikapi.gif"),
        },
        {
          n: "PIKACHU DE ASH",
          d: 101,
          s: NP.u("wp-content/uploads/2026/09/pikapi.gif"),
        },
      ],
    },
    bulbasaur: {
      dex: "#001",
      gen: "I",
      region: "KANTO",
      name: "BULBASAUR",
      types: ["PLANTA", "VENENO"],
      s: BASE + "bulbasaur.gif",
      evo: [
        { n: "BULBASAUR", d: 0, s: BASE + "bulbasaur.gif" },
        { n: "IVYSAUR", d: 16, s: BASE + "ivysaur.gif" },
        { n: "VENUSAUR", d: 32, s: BASE + "venusaur-f.gif" },
      ],
    },
    charmander: {
      dex: "#004",
      gen: "I",
      region: "KANTO",
      name: "CHARMANDER",
      types: ["FUEGO"],
      s: BASE + "charmander.gif",
      evo: [
        { n: "CHARMANDER", d: 0, s: BASE + "charmander.gif" },
        { n: "CHARMELEON", d: 16, s: BASE + "charmeleon.gif" },
        { n: "CHARIZARD", d: 36, s: BASE + "charizard.gif" },
      ],
    },
    squirtle: {
      dex: "#007",
      gen: "I",
      region: "KANTO",
      name: "SQUIRTLE",
      types: ["AGUA"],
      s: BASE + "squirtle.gif",
      evo: [
        { n: "SQUIRTLE", d: 0, s: BASE + "squirtle.gif" },
        { n: "WARTORTLE", d: 16, s: BASE + "wartortle-1.gif" },
        { n: "BLASTOISE", d: 36, s: BASE + "blastoise.gif" },
      ],
    },
    chikorita: {
      dex: "#152",
      gen: "II",
      region: "JOHTO",
      name: "CHIKORITA",
      types: ["PLANTA"],
      s: BASE + "chikorita.gif",
      evo: [
        { n: "CHIKORITA", d: 0, s: BASE + "chikorita.gif" },
        { n: "BAYLEEF", d: 16, s: BASE + "bayleef.gif" },
        { n: "MEGANIUM", d: 36, s: BASE + "meganium-f.gif" },
      ],
    },
    cyndaquil: {
      dex: "#155",
      gen: "II",
      region: "JOHTO",
      name: "CYNDAQUIL",
      types: ["FUEGO"],
      s: BASE + "cyndaquil.gif",
      evo: [
        { n: "CYNDAQUIL", d: 0, s: BASE + "cyndaquil.gif" },
        { n: "QUILAVA", d: 16, s: BASE + "quilava.gif" },
        { n: "TYPHLOSION", d: 36, s: BASE + "typhlosion.gif" },
      ],
    },
    totodile: {
      dex: "#158",
      gen: "II",
      region: "JOHTO",
      name: "TOTODILE",
      types: ["AGUA"],
      s: BASE + "totodile.gif",
      evo: [
        { n: "TOTODILE", d: 0, s: BASE + "totodile.gif" },
        { n: "CROCONAW", d: 16, s: BASE + "croconaw.gif" },
        { n: "FERALIGATR", d: 36, s: BASE + "feraligatr.gif" },
      ],
    },
    treecko: {
      dex: "#252",
      gen: "III",
      region: "HOENN",
      name: "TREECKO",
      types: ["PLANTA"],
      s: BASE + "treecko.gif",
      evo: [
        { n: "TREECKO", d: 0, s: BASE + "treecko.gif" },
        { n: "GROVYLE", d: 16, s: BASE + "grovyle.gif" },
        { n: "SCEPTILE", d: 36, s: BASE + "sceptile-mega.gif" },
      ],
    },
    torchic: {
      dex: "#255",
      gen: "III",
      region: "HOENN",
      name: "TORCHIC",
      types: ["FUEGO"],
      s: BASE + "torchic.gif",
      evo: [
        { n: "TORCHIC", d: 0, s: BASE + "torchic.gif" },
        { n: "COMBUSKEN", d: 16, s: BASE + "combusken.gif" },
        { n: "BLAZIKEN", d: 36, s: BASE + "blaziken-f.gif" },
      ],
    },
    mudkip: {
      dex: "#258",
      gen: "III",
      region: "HOENN",
      name: "MUDKIP",
      types: ["AGUA"],
      s: BASE + "mudkip.gif",
      evo: [
        { n: "MUDKIP", d: 0, s: BASE + "mudkip.gif" },
        { n: "MARSHTOMP", d: 16, s: BASE + "marshtomp.gif" },
        { n: "SWAMPERT", d: 36, s: BASE + "swampert.gif" },
      ],
    },
    turtwig: {
      dex: "#387",
      gen: "IV",
      region: "SINNOH",
      name: "TURTWIG",
      types: ["PLANTA"],
      s: BASE + "turtwig.gif",
      evo: [
        { n: "TURTWIG", d: 0, s: BASE + "turtwig.gif" },
        { n: "GROTLE", d: 16, s: BASE + "grotle.gif" },
        { n: "TORTERRA", d: 36, s: BASE + "torterra.gif" },
      ],
    },
    chimchar: {
      dex: "#390",
      gen: "IV",
      region: "SINNOH",
      name: "CHIMCHAR",
      types: ["FUEGO"],
      s: BASE + "chimchar.gif",
      evo: [
        { n: "CHIMCHAR", d: 0, s: BASE + "chimchar.gif" },
        { n: "MONFERNO", d: 16, s: BASE + "monferno.gif" },
        { n: "INFERNAPE", d: 36, s: BASE + "infernape.gif" },
      ],
    },
    piplup: {
      dex: "#393",
      gen: "IV",
      region: "SINNOH",
      name: "PIPLUP",
      types: ["AGUA"],
      s: BASE + "piplup.gif",
      evo: [
        { n: "PIPLUP", d: 0, s: BASE + "piplup.gif" },
        { n: "PRINPLUP", d: 16, s: BASE + "prinplup.gif" },
        { n: "EMPOLEON", d: 36, s: BASE + "empoleon.gif" },
      ],
    },
    snivy: {
      dex: "#495",
      gen: "V",
      region: "UNOVA",
      name: "SNIVY",
      types: ["PLANTA"],
      s: BASE + "snivy.gif",
      evo: [
        { n: "SNIVY", d: 0, s: BASE + "snivy.gif" },
        { n: "SERVINE", d: 17, s: BASE + "servine.gif" },
        { n: "SERPERIOR", d: 36, s: BASE + "serperior.gif" },
      ],
    },
    tepig: {
      dex: "#498",
      gen: "V",
      region: "UNOVA",
      name: "TEPIG",
      types: ["FUEGO"],
      s: BASE + "tepig.gif",
      evo: [
        { n: "TEPIG", d: 0, s: BASE + "tepig.gif" },
        { n: "PIGNITE", d: 17, s: BASE + "pignite.gif" },
        { n: "EMBOAR", d: 36, s: BASE + "emboar.gif" },
      ],
    },
    oshawott: {
      dex: "#501",
      gen: "V",
      region: "UNOVA",
      name: "OSHAWOTT",
      types: ["AGUA"],
      s: BASE + "oshawott.gif",
      evo: [
        { n: "OSHAWOTT", d: 0, s: BASE + "oshawott.gif" },
        { n: "DEWOTT", d: 17, s: BASE + "dewott.gif" },
        { n: "SAMUROTT", d: 36, s: BASE + "samurott.gif" },
      ],
    },
    chespin: {
      dex: "#650",
      gen: "VI",
      region: "KALOS",
      name: "CHESPIN",
      types: ["PLANTA"],
      s: BASE + "chespin.gif",
      evo: [
        { n: "CHESPIN", d: 0, s: BASE + "chespin.gif" },
        { n: "QUILLADIN", d: 16, s: BASE + "quilladin.gif" },
        { n: "CHESNAUGHT", d: 36, s: BASE + "chesnaught.gif" },
      ],
    },
    fennekin: {
      dex: "#653",
      gen: "VI",
      region: "KALOS",
      name: "FENNEKIN",
      types: ["FUEGO"],
      s: BASE + "fennekin.gif",
      evo: [
        { n: "FENNEKIN", d: 0, s: BASE + "fennekin.gif" },
        { n: "BRAIXEN", d: 16, s: BASE + "braixen.gif" },
        { n: "DELPHOX", d: 36, s: BASE + "delphox.gif" },
      ],
    },
    froakie: {
      dex: "#656",
      gen: "VI",
      region: "KALOS",
      name: "FROAKIE",
      types: ["AGUA"],
      s: BASE + "froakie.gif",
      evo: [
        { n: "FROAKIE", d: 0, s: BASE + "froakie.gif" },
        { n: "FROGADIER", d: 16, s: BASE + "frogadier.gif" },
        { n: "GRENINJA", d: 36, s: BASE + "greninja.gif" },
      ],
    },
    rowlet: {
      dex: "#722",
      gen: "VII",
      region: "ALOLA",
      name: "ROWLET",
      types: ["PLANTA", "VOLADOR"],
      s: BASE + "rowlet.gif",
      evo: [
        { n: "ROWLET", d: 0, s: BASE + "rowlet.gif" },
        { n: "DARTRIX", d: 17, s: BASE + "dartrix.gif" },
        { n: "DECIDUEYE", d: 34, s: BASE + "decidueye.gif" },
      ],
    },
    litten: {
      dex: "#725",
      gen: "VII",
      region: "ALOLA",
      name: "LITTEN",
      types: ["FUEGO"],
      s: BASE + "litten.gif",
      evo: [
        { n: "LITTEN", d: 0, s: BASE + "litten.gif" },
        { n: "TORRACAT", d: 17, s: BASE + "torracat.gif" },
        { n: "INCINEROAR", d: 34, s: BASE + "incineroar.gif" },
      ],
    },
    popplio: {
      dex: "#728",
      gen: "VII",
      region: "ALOLA",
      name: "POPPLIO",
      types: ["AGUA"],
      s: BASE + "popplio.gif",
      evo: [
        { n: "POPPLIO", d: 0, s: BASE + "popplio.gif" },
        { n: "BRIONNE", d: 17, s: BASE + "brionne.gif" },
        { n: "PRIMARINA", d: 34, s: BASE + "primarina.gif" },
      ],
    },
    grookey: {
      dex: "#810",
      gen: "VIII",
      region: "GALAR",
      name: "GROOKEY",
      types: ["PLANTA"],
      s: BASE + "grookey.gif",
      evo: [
        { n: "GROOKEY", d: 0, s: BASE + "grookey.gif" },
        { n: "THWACKEY", d: 16, s: BASE + "thwackey.gif" },
        { n: "RILLABOOM", d: 35, s: BASE + "rillaboom.gif" },
      ],
    },
    scorbunny: {
      dex: "#813",
      gen: "VIII",
      region: "GALAR",
      name: "SCORBUNNY",
      types: ["FUEGO"],
      s: BASE + "scorbunny.gif",
      evo: [
        { n: "SCORBUNNY", d: 0, s: BASE + "scorbunny.gif" },
        { n: "RABOOT", d: 16, s: BASE + "raboot.gif" },
        { n: "CINDERACE", d: 35, s: BASE + "cinderace.gif" },
      ],
    },
    sobble: {
      dex: "#816",
      gen: "VIII",
      region: "GALAR",
      name: "SOBBLE",
      types: ["AGUA"],
      s: BASE + "sobble.gif",
      evo: [
        { n: "SOBBLE", d: 0, s: BASE + "sobble.gif" },
        { n: "DRIZZILE", d: 16, s: BASE + "drizzile.gif" },
        { n: "INTELEON", d: 35, s: BASE + "inteleon.gif" },
      ],
    },
    sprigatito: {
      dex: "#906",
      gen: "IX",
      region: "PALDEA",
      name: "SPRIGATITO",
      types: ["PLANTA"],
      s: BASE + "sprigatito-1.gif",
      evo: [
        { n: "SPRIGATITO", d: 0, s: BASE + "sprigatito-1.gif" },
        { n: "FLORAGATO", d: 16, s: BASE + "floragato-1.gif" },
        { n: "MEOWSCARADA", d: 36, s: BASE + "meowscarada.gif" },
      ],
    },
    fuecoco: {
      dex: "#909",
      gen: "IX",
      region: "PALDEA",
      name: "FUECOCO",
      types: ["FUEGO"],
      s: BASE + "fuecoco-1.gif",
      evo: [
        { n: "FUECOCO", d: 0, s: BASE + "fuecoco-1.gif" },
        { n: "CROCALOR", d: 16, s: BASE + "crocalor-1.gif" },
        { n: "SKELEDIRGE", d: 36, s: BASE + "skeledirge.gif" },
      ],
    },
    quaxly: {
      dex: "#912",
      gen: "IX",
      region: "PALDEA",
      name: "QUAXLY",
      types: ["AGUA"],
      s: BASE + "quaxly-1.gif",
      evo: [
        { n: "QUAXLY", d: 0, s: BASE + "quaxly-1.gif" },
        { n: "QUAXWELL", d: 16, s: BASE + "quaxwell.gif" },
        { n: "QUAQUAVAL", d: 36, s: BASE + "quaquaval.gif" },
      ],
    },
  };
  (function () {
    var LG = U + "2026/10/",
      ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
    var REGION = [
      "",
      "KANTO",
      "JOHTO",
      "HOENN",
      "SINNOH",
      "TESELIA",
      "KALOS",
      "ALOLA",
      "GALAR",
      "PALDEA",
    ];
    [
      ["lgArticuno", "Articuno", 1, 144, "articuno.gif", ["HIELO", "VOLADOR"]],
      ["lgZapdos", "Zapdos", 1, 145, "zapdos.gif", ["ELECTRICO", "VOLADOR"]],
      ["lgMoltres", "Moltres", 1, 146, "moltres.gif", ["FUEGO", "VOLADOR"]],
      ["lgMewtwo", "Mewtwo", 1, 150, "MEWTO.webp", ["PSIQUICO"]],
      ["lgRaikou", "Raikou", 2, 243, "raikou.gif", ["ELECTRICO"]],
      ["lgEntei", "Entei", 2, 244, "entei.gif", ["FUEGO"]],
      ["lgSuicune", "Suicune", 2, 245, "suicune.gif", ["AGUA"]],
      ["lgLugia", "Lugia", 2, 249, "lugia.gif", ["PSIQUICO", "VOLADOR"]],
      ["lgHooh", "Ho-Oh", 2, 250, "hooh.gif", ["FUEGO", "VOLADOR"]],
      ["lgRegirock", "Regirock", 3, 377, "regirock.gif", ["ROCA"]],
      ["lgRegice", "Regice", 3, 378, "regice.gif", ["HIELO"]],
      ["lgRegisteel", "Registeel", 3, 379, "registeel.gif", ["ACERO"]],
      ["lgLatias", "Latias", 3, 380, "latias.gif", ["DRAGON", "PSIQUICO"]],
      ["lgLatios", "Latios", 3, 381, "latios.gif", ["DRAGON", "PSIQUICO"]],
      ["lgKyogre", "Kyogre", 3, 382, "kyogre.gif", ["AGUA"]],
      ["lgGroudon", "Groudon", 3, 383, "groudon.gif", ["TIERRA"]],
      ["lgRayquaza", "Rayquaza", 3, 384, "rayquaza.gif", ["DRAGON", "VOLADOR"]],
      ["lgUxie", "Uxie", 4, 480, "uxie.gif", ["PSIQUICO"]],
      ["lgMesprit", "Mesprit", 4, 481, "mesprit.gif", ["PSIQUICO"]],
      ["lgAzelf", "Azelf", 4, 482, "azelf.gif", ["PSIQUICO"]],
      ["lgDialga", "Dialga", 4, 483, "dialga.gif", ["ACERO", "DRAGON"]],
      ["lgPalkia", "Palkia", 4, 484, "palkia.gif", ["AGUA", "DRAGON"]],
      ["lgHeatran", "Heatran", 4, 485, "heatran.gif", ["FUEGO", "ACERO"]],
      ["lgRegigigas", "Regigigas", 4, 486, "regigigas.gif", ["NORMAL"]],
      [
        "lgGiratina",
        "Giratina",
        4,
        487,
        "giratina.gif",
        ["FANTASMA", "DRAGON"],
      ],
      ["lgCresselia", "Cresselia", 4, 488, "cresselia.gif", ["PSIQUICO"]],
      ["lgCobalion", "Cobalion", 5, 638, "cobalion.gif", ["ACERO", "LUCHA"]],
      ["lgTerrakion", "Terrakion", 5, 639, "terrakion.gif", ["ROCA", "LUCHA"]],
      ["lgVirizion", "Virizion", 5, 640, "virizion.gif", ["PLANTA", "LUCHA"]],
      ["lgTornadus", "Tornadus", 5, 641, "tornadus.gif", ["VOLADOR"]],
      [
        "lgThundurus",
        "Thundurus",
        5,
        642,
        "thundurus.gif",
        ["ELECTRICO", "VOLADOR"],
      ],
      ["lgReshiram", "Reshiram", 5, 643, "reshiram.gif", ["DRAGON", "FUEGO"]],
      ["lgZekrom", "Zekrom", 5, 644, "zekrom.gif", ["DRAGON", "ELECTRICO"]],
      ["lgLandorus", "Landorus", 5, 645, "landorus.gif", ["TIERRA", "VOLADOR"]],
      ["lgKyurem", "Kyurem", 5, 646, "kyurem.gif", ["DRAGON", "HIELO"]],
      ["lgXerneas", "Xerneas", 6, 716, "xerneas.gif", ["HADA"]],
      ["lgYveltal", "Yveltal", 6, 717, "yveltal.gif", ["SINIESTRO", "VOLADOR"]],
      ["lgZygarde", "Zygarde", 6, 718, "zygarde.gif", ["DRAGON", "TIERRA"]],
      ["lgTypenull", "Código Cero", 7, 772, "typenull.gif", ["NORMAL"]],
      ["lgSilvally", "Silvally", 7, 773, "silvally.gif", ["NORMAL"]],
      [
        "lgTapukoko",
        "Tapu Koko",
        7,
        785,
        "tapukoko.gif",
        ["ELECTRICO", "HADA"],
      ],
      ["lgTapulele", "Tapu Lele", 7, 786, "tapulele.gif", ["PSIQUICO", "HADA"]],
      ["lgTapubulu", "Tapu Bulu", 7, 787, "tapubulu.gif", ["PLANTA", "HADA"]],
      ["lgTapufini", "Tapu Fini", 7, 788, "tapufini.gif", ["AGUA", "HADA"]],
      ["lgCosmog", "Cosmog", 7, 789, "cosmog.gif", ["PSIQUICO"]],
      ["lgCosmoem", "Cosmoem", 7, 790, "cosmoem.gif", ["PSIQUICO"]],
      ["lgSolgaleo", "Solgaleo", 7, 791, "solgaleo.gif", ["PSIQUICO", "ACERO"]],
      ["lgLunala", "Lunala", 7, 792, "lunala.gif", ["PSIQUICO", "FANTASMA"]],
      ["lgNecrozma", "Necrozma", 7, 800, "necrozma.gif", ["PSIQUICO"]],
      ["lgZacian", "Zacian", 8, 888, "zacian.gif", ["HADA"]],
      ["lgZamazenta", "Zamazenta", 8, 889, "zamazenta.gif", ["LUCHA"]],
      [
        "lgEternatus",
        "Eternatus",
        8,
        890,
        "eternatus.gif",
        ["VENENO", "DRAGON"],
      ],
      ["lgKubfu", "Kubfu", 8, 891, "kubfu.gif", ["LUCHA"]],
      ["lgUrshifu", "Urshifu", 8, 892, "urshifu.gif", ["LUCHA", "SINIESTRO"]],
      ["lgRegieleki", "Regieleki", 8, 894, "regieleki.gif", ["ELECTRICO"]],
      ["lgRegidrago", "Regidrago", 8, 895, "regidrago.gif", ["DRAGON"]],
      ["lgGlastrier", "Glastrier", 8, 896, "glastrier.gif", ["HIELO"]],
      ["lgSpectrier", "Spectrier", 8, 897, "spectrier.gif", ["FANTASMA"]],
      ["lgCalyrex", "Calyrex", 8, 898, "calyrex.gif", ["PSIQUICO", "PLANTA"]],
      ["lgEnamorus", "Enamorus", 8, 905, "enamorus.gif", ["HADA", "VOLADOR"]],
      ["lgWochien", "Wo-Chien", 9, 1001, "1001.gif", ["SINIESTRO", "PLANTA"]],
      ["lgChienpao", "Chien-Pao", 9, 1002, "1002.gif", ["SINIESTRO", "HIELO"]],
      ["lgTinglu", "Ting-Lu", 9, 1003, "1003.gif", ["SINIESTRO", "TIERRA"]],
      ["lgChiyu", "Chi-Yu", 9, 1004, "1004.gif", ["SINIESTRO", "FUEGO"]],
      ["lgKoraidon", "Koraidon", 9, 1007, "1007.gif", ["LUCHA", "DRAGON"]],
      [
        "lgMiraidon",
        "Miraidon",
        9,
        1008,
        "miraidon.png",
        ["ELECTRICO", "DRAGON"],
      ],
      ["lgOkidogi", "Okidogi", 9, 1014, "1014.gif", ["VENENO", "LUCHA"]],
      ["lgMunkidori", "Munkidori", 9, 1015, "1015.gif", ["VENENO", "PSIQUICO"]],
      ["lgFezandipiti", "Fezandipiti", 9, 1016, "1016.gif", ["VENENO", "HADA"]],
      ["lgOgerpon", "Ogerpon", 9, 1017, "ogerpon.png", ["PLANTA"]],
      ["lgTerapagos", "Terapagos", 9, 1024, "terapagos.png", ["NORMAL"]],
    ].forEach(function (r) {
      if (PK[r[0]]) return;
      var s = /^https?:/.test(r[4]) ? r[4] : LG + r[4],
        dex = "#" + (r[3] < 1000 ? ("00" + r[3]).slice(-3) : r[3]);
      var up = r[1].toUpperCase();
      PK[r[0]] = {
        dex: dex,
        gen: ROMAN[r[2]],
        region: REGION[r[2]],
        name: up,
        profile: r[0],
        special: "legend",
        types: r[5],
        s: s,
        evo: [{ n: up, t: r[1], d: 0, dex: dex, types: r[5], s: s }],
      };
    });
  })();
  var RC = {
    cache: "np_pokerecreo_v1:",
    current: "np_pokerecreo_actual",
    moodSad: 35,
    moodHappy: 70,
    dirty: 40,
    tired: 70,
    decay: {
      capHours: 72,
      moodPerHour: 2.5,
      fatiguePerHour: 3,
      dirtPerHour: 0.027,
      dirtyFactor: 0.5,
      tiredFactor: 0.5,
    },
  };
  var RI = U + "2026/10/";
  var STATS = [
    ["mood", "Ánimo", "#95ab4b", "pelota3d.webp"],
    ["hygiene", "Higiene", "#66b8a5", "banarse.png"],
    ["affection", "Te quiere", "#d18c99", "afecto.webp"],
    ["fatigue", "Cansancio", "#8aab75", "camita.png"],
  ];
  function hygiene(s) {
    var d = s.dirt || [];
    if (!d.length) return 100;
    return clamp(
      100 -
        (d.reduce(function (a, b) {
          return a + b;
        }, 0) /
          d.length) *
          100,
      0,
      100,
    );
  }
  function advance(s, now) {
    var ms = clamp(now - num(s.lastTick, now), 0, RC.decay.capHours * 36e5);
    if (ms > 0 && s.sleeping) {
      var rate = 10 / 6e4,
        slept = Math.min(ms, s.fatigue / rate);
      s.fatigue = clamp(s.fatigue - slept * rate, 0, 100);
      ms -= slept;
      if (s.fatigue <= 0.01) {
        s.fatigue = 0;
        s.sleeping = !1;
        s.mood = clamp(s.mood + 6, 0, 100);
      }
    }
    if (s.sleeping) return s;
    for (var h = ms / 36e5; h > 0; h -= 1) {
      var k = Math.min(h, 1),
        f =
          1 +
          (hygiene(s) <= RC.dirty ? RC.decay.dirtyFactor : 0) +
          (s.fatigue >= RC.tired ? RC.decay.tiredFactor : 0);
      s.mood = Math.max(
        Math.min(s.mood, 0),
        s.mood - k * RC.decay.moodPerHour * f,
      );
      s.fatigue = clamp(s.fatigue + k * RC.decay.fatiguePerHour, 0, 100);
      s.dirt = s.dirt.map(function (v) {
        return clamp(v + k * RC.decay.dirtPerHour, 0, 1);
      });
    }
    return s;
  }
  function careState(S, owner) {
    var id = JSON.stringify([S.key, S.start]),
      token = JSON.stringify([String(owner), id]);
    var a = S.pokeRecreo && S.pokeRecreo.byId && S.pokeRecreo.byId[id];
    var b = readJSON(RC.cache + encodeURIComponent(token));
    var ptr = null;
    try {
      var cur = localStorage.getItem(RC.current);
      if (cur && cur.indexOf(id) !== -1 && cur !== token)
        ptr = readJSON(RC.cache + encodeURIComponent(cur));
    } catch (e) {}
    var best = [a, b, ptr]
      .filter(function (x) {
        return x && typeof x === "object" && x.version === 1;
      })
      .sort(function (x, y) {
        return num(y.updatedAt) - num(x.updatedAt);
      })[0];
    if (!best) return null;
    var s = {
      mood: clamp(num(best.mood, 50), 0, 100),
      affection: clamp(num(best.affection, 10), 0, 100),
      fatigue: clamp(num(best.fatigue, 35), 0, 100),
      sleeping: best.sleeping === !0,
      lastTick: num(best.lastTick, Date.now()),
      house: best.house,
      dirt:
        Array.isArray(best.dirt) && best.dirt.length
          ? best.dirt.map(function (v) {
              return clamp(num(v, 0.65), 0, 1);
            })
          : [0.65],
    };
    return advance(s, Date.now());
  }
  function feeling(s) {
    if (s.sleeping) return "sleep";
    var bad = [
      ["tired", (s.fatigue - RC.tired) / (100 - RC.tired)],
      ["sad", (RC.moodSad - s.mood) / RC.moodSad],
      ["dirty", (RC.dirty - hygiene(s)) / RC.dirty],
    ]
      .filter(function (x) {
        return x[1] >= 0;
      })
      .sort(function (a, b) {
        return b[1] - a[1];
      });
    return bad.length ? bad[0][0] : s.mood >= RC.moodHappy ? "happy" : "calm";
  }
  var FEEL = {
    sleep: ["está durmiendo", "", "Dejarle dormir"],
    tired: ["tiene sueño 💤", "bad", "Acostarlo"],
    sad: ["está triste 💧", "bad", "Jugar con"],
    dirty: ["está sucio 🫧", "bad", "Bañarlo"],
    happy: ["está feliz ♪", "good", ""],
    calm: ["está tranquilo", "", ""],
  };
  function pokeValid(S) {
    return !!(S && typeof S === "object" && S.start && S.key && PK[S.key]);
  }
  var POKE = { S: null, owner: "local" };
  var WHO = { list: null, i: 0, timer: 0, imgs: [] };
  function startWho() {
    var box = $("[data-poke-who]");
    if (WHO.timer || !box) return;
    if (!WHO.list) {
      var seen = {};
      WHO.list = shuffle(
        ["charmander", "bulbasaur", "squirtle", "chimchar", "oshawott"]
          .filter(function (k) {
            return PK[k];
          })
          .map(function (k) {
            var e = PK[k].evo && PK[k].evo[0];
            return (e && e.s) || PK[k].s;
          })
          .filter(function (s) {
            if (!s || seen[s]) return !1;
            seen[s] = 1;
            return !0;
          }),
      );
    }
    if (!WHO.list.length) return;
    box.textContent = "";
    WHO.imgs = [];
    for (var n = 0; n < 2; n++) {
      var im = el("img");
      im.alt = "";
      im.decoding = "async";
      box.appendChild(im);
      WHO.imgs.push(im);
    }
    var cur = 0;
    function show() {
      var a = WHO.imgs[cur],
        b = WHO.imgs[1 - cur];
      b.classList.remove("on");
      if (b.getAttribute("src")) {
        b.classList.add("off");
        setTimeout(function () {
          b.classList.remove("off");
        }, 450);
      }
      a.classList.remove("off");
      a.onload = function () {
        a.classList.add("on");
      };
      a.src = WHO.list[WHO.i++ % WHO.list.length];
      if (a.complete && a.naturalWidth) a.classList.add("on");
      cur = 1 - cur;
      var pre = new Image();
      pre.src = WHO.list[WHO.i % WHO.list.length];
    }
    show();
    WHO.timer = setInterval(function () {
      if (!document.hidden && visible) show();
    }, 2400);
  }
  function stopWho() {
    if (WHO.timer) {
      clearInterval(WHO.timer);
      WHO.timer = 0;
    }
    var box = $("[data-poke-who]");
    if (box) box.textContent = "";
  }
  var LOCK =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17 9V7A5 5 0 0 0 7 7v2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-8-2a3 3 0 0 1 6 0v2H9zm4 9.7V18h-2v-1.3a1.8 1.8 0 1 1 2 0z"/></svg>';
  function paintStats(stats, vals, alert, locked) {
    stats.hidden = !1;
    stats.textContent = "";
    STATS.forEach(function (x) {
      var v = Math.round(vals[x[0]] || 0);
      var d = el("div", "pr-stat" + (alert[x[0]] ? " is-alert" : ""));
      d.style.setProperty("--sc", x[2]);
      var top = el("div", "pr-stat-top");
      var ic = el("img");
      ic.src = RI + x[3];
      ic.alt = "";
      ic.loading = "lazy";
      ic.decoding = "async";
      top.appendChild(ic);
      top.appendChild(el("span", "", x[1]));
      if (locked) {
        var lk = el("i", "pr-lock");
        lk.innerHTML = LOCK;
        lk.title = "Bloqueado";
        top.appendChild(lk);
      }
      d.appendChild(top);
      var row = el("div", "pr-stat-row"),
        m = el("div", "pr-meter"),
        i = el("i");
      m.appendChild(i);
      row.appendChild(m);
      row.appendChild(el("b", "", v + "%"));
      d.appendChild(row);
      stats.appendChild(d);
      if (!locked)
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            i.style.transform = "scaleX(" + clamp(v / 100, 0.02, 1) + ")";
          });
        });
    });
  }
  var HOUSES = {
    onix: "Dormitorio-de-cueva-volcanica-con-lava.webp",
    arbol: "Habitacion-acogedora-estilo-Pokopia.webp",
    invierno: "Taza-de-cacao-sobre-mesa-helada.webp",
    desierto: "59sulvye9png1.webp",
  };
  function roomBg(house) {
    var b = $("[data-poke-bg]"),
      url =
        REC + HOUSES[LOGGED ? (HOUSES[house] ? house : "invierno") : "arbol"];
    if (b.getAttribute("data-src") === url) return;
    b.setAttribute("data-src", url);
    b.classList.remove("on");
    var im = new Image();
    im.decoding = "async";
    im.onload = function () {
      if (b.getAttribute("data-src") !== url) return;
      b.style.backgroundImage = 'url("' + url + '")';
      b.classList.add("on");
    };
    im.src = url;
  }
  function renderPoke() {
    var S = POKE.S,
      card = $(".nph-poke"),
      cta = $("[data-poke-cta]"),
      img = $("[data-poke-img]"),
      daily = $("[data-poke-daily]");
    var bubble = $("[data-poke-feel]"),
      stats = $("[data-poke-stats]"),
      lvChip = $("[data-poke-lv]");
    daily.textContent = "";
    if (!pokeValid(S)) {
      card.classList.remove("is-sleep");
      img.hidden = !0;
      lvChip.hidden = !0;
      if (LOGGED) {
        stats.hidden = !0;
        stats.classList.remove("is-locked");
      } else {
        stats.classList.add("is-locked");
        paintStats(stats, {}, {}, !0);
      }
      $("[data-poke-title]").textContent = "Poké Recreo";
      paintSex(null);
      bubble.hidden = !0;
      var p = el("p");
      p.appendChild(el("b", "", "Aún no tienes compañero"));
      p.appendChild(
        document.createTextNode(
          LOGGED
            ? "Elige tu Pokémon y cuídalo cada día para que crezca contigo."
            : "Crea tu cuenta para ver qué Pokémon cuidarás.",
        ),
      );
      daily.appendChild(p);
      if (LOGGED) {
        cta.textContent = "Elegir Pokémon";
        cta.href = URLS.poke;
      } else {
        cta.textContent = "Entrar o Crear Cuenta";
        cta.href = URLS.login;
      }
      roomBg(null);
      startWho();
      return { summary: "" };
    }
    stopWho();
    var pk = PK[S.key],
      stage = clamp(Math.floor(num(S.evoStage)), 0, pk.evo.length - 1),
      form = pk.evo[stage];
    var name = form.t || cap(form.n),
      lv = clamp(Math.floor(num(S.level, 1)), 1, 100);
    $("[data-poke-title]").textContent = name;
    paintSex(S);
    lvChip.hidden = !1;
    lvChip.textContent = "Nv. " + lv;
    img.hidden = !1;
    if (img.getAttribute("src") !== form.s) {
      img.src = form.s;
      img.alt = name;
    }
    var care = careState(S, POKE.owner);
    roomBg(care && care.house);
    var st = care || {
      mood: clamp(num(S.happiness, 50), 0, 100),
      affection: 10,
      fatigue: 35,
      dirt: [0.65],
      sleeping: !1,
    };
    var fe = care
      ? feeling(st)
      : st.mood >= 70
        ? "happy"
        : st.mood < 35
          ? "sad"
          : "calm";
    var dirty = hygiene(st) <= RC.dirty,
      notice = dirty ? FEEL.dirty : FEEL[fe];
    bubble.hidden = !1;
    bubble.textContent = name + " " + notice[0];
    bubble.className = "pr-bubble" + (notice[1] ? " " + notice[1] : "");
    card.classList.toggle("is-sleep", fe === "sleep");
    var vals = {
      mood: st.mood,
      hygiene: hygiene(st),
      affection: st.affection,
      fatigue: st.fatigue,
    };
    var alert = {
      mood: st.mood < RC.moodSad,
      hygiene: vals.hygiene <= RC.dirty,
      affection: !1,
      fatigue: st.fatigue >= RC.tired,
    };
    stats.hidden = !1;
    stats.textContent = "";
    stats.classList.remove("is-locked");
    paintStats(stats, vals, alert, !1);
    var today = new Date().toDateString(),
      fed = S.feedDate === today ? clamp(num(S.feedToday), 0, 5) : 0;
    var c1 = el("span");
    c1.appendChild(el("small", "", "Comidas de hoy"));
    c1.appendChild(el("strong", "", fed + " / 5"));
    daily.appendChild(c1);
    var next = pk.evo[stage + 1],
      c2 = el("span");
    if (next && !pk.friendshipEvolution && next.d > lv) {
      c2.appendChild(el("small", "", "Evoluciona a " + cap(next.n)));
      c2.appendChild(el("strong", "", "Nv. " + next.d));
    } else if (next && pk.friendshipEvolution) {
      c2.appendChild(el("small", "", "Evoluciona"));
      c2.appendChild(el("strong", "", "Con cariño"));
    } else {
      c2.appendChild(el("small", "", "Te quiere"));
      c2.appendChild(el("strong", "", Math.round(st.affection) + "%"));
    }
    daily.appendChild(c2);
    if (!LOGGED) {
      cta.href = URLS.login;
      cta.textContent = "Entrar o Crear Cuenta";
    } else {
      cta.href = URLS.poke;
      var act = notice === FEEL.sad ? FEEL.sad[2] + " " + name : notice[2];
      cta.textContent =
        fe === "sleep"
          ? FEEL.sleep[2]
          : act || (fed < 5 ? "Dar de comer a " + name : "Visitar a " + name);
    }
    return {
      summary:
        notice[1] === "bad"
          ? name + " " + notice[0].replace(/ [^ ]+$/, "")
          : "",
    };
  }
  function loadLocalPoke() {
    var S = readJSON("pkw_v6");
    if (pokeValid(S)) {
      if (LOGGED && S._u && USER.id && +S._u !== +USER.id) S = null;
    } else S = null;
    POKE.S = S;
    POKE.owner = S && S._u ? String(S._u) : "local";
  }
  function loadServerPoke() {
    if (!LOGGED) return Promise.resolve();
    var fd = new FormData();
    fd.append("action", "np_pkw_cargar");
    return fetch(AJAX, {
      method: "POST",
      body: fd,
      credentials: "same-origin",
      cache: "no-store",
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (r) {
        var d = r && r.success && r.data;
        if (!d || !d.uid) return;
        var rem = d.estado;
        if (typeof rem === "string") {
          try {
            rem = rem ? JSON.parse(rem) : null;
          } catch (e) {
            rem = null;
          }
        }
        var local = POKE.S;
        if (local && local._u && +local._u !== +d.uid) local = null;
        if (
          pokeValid(rem) &&
          !(local && local._p && num(local._rev) >= num(d.rev))
        ) {
          POKE.S = rem;
        } else if (!local && !pokeValid(rem)) POKE.S = null;
        POKE.owner = String(d.uid);
      })
      .catch(function () {});
  }
  var PL = {
    nonce: "",
    yo: null,
    busy: !1,
    timer: 0,
    failures: 0,
    signature: "",
    sessionAt: 0,
    stopped: !1,
    theme: "dark",
    authRetries: 0,
  };
  function plazaApi(action, data) {
    var fd = new FormData();
    fd.append("action", action);
    if (action !== "npmp_init" && PL.nonce) fd.append("nonce", PL.nonce);
    if (data)
      Object.keys(data).forEach(function (k) {
        fd.append(k, data[k]);
      });
    var ctrl = window.AbortController ? new AbortController() : null;
    var timeout = setTimeout(function () {
      if (ctrl) ctrl.abort();
    }, 12000);
    return fetch(AJAX, {
      method: "POST",
      body: fd,
      credentials: "same-origin",
      cache: "no-store",
      signal: ctrl ? ctrl.signal : undefined,
    })
      .then(function (r) {
        return r.text();
      })
      .then(function (t) {
        clearTimeout(timeout);
        var j = null;
        try {
          j = JSON.parse(t);
        } catch (e) {}
        if (j && j.success) return j.data || {};
        var err = new Error((j && j.data && j.data.msg) || "error");
        err.code =
          (j && j.data && j.data.code) ||
          (String(t).trim() === "0" ? "noplugin" : "error");
        throw err;
      })
      .catch(function (e) {
        clearTimeout(timeout);
        throw e;
      });
  }
  var fHour = new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    fDay = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" });
  function shortTime(ts) {
    if (!ts) return "";
    var d = new Date(ts * 1000),
      n = new Date();
    if (!isFinite(d.getTime())) return "";
    if (d.toDateString() === n.toDateString()) return fHour.format(d);
    if (d.toDateString() === new Date(n - 864e5).toDateString()) return "Ayer";
    return fDay.format(d).replace(".", "");
  }
  function plazaTitle(parts, sub) {
    var h = $("[data-plaza-t]");
    h.textContent = "";
    parts.forEach(function (p) {
      h.appendChild(p[1] ? el("em", "", p[0]) : document.createTextNode(p[0]));
    });
    $("[data-plaza-s]").textContent = sub || "";
    $("[data-plaza-s]").hidden = !sub;
  }
  var PZ_SELLOS = [
    "stamp_01000q",
    "stamp_02000u",
    "stamp_03001u",
    "stamp_04001u",
    "stamp_07000u",
    "stamp1-1",
    "stamp_00014u",
    "stamp_13000u",
    "stamp_00012u",
    "stamp4",
    "stamp_00004u",
    "stamp_09000u",
  ];
  var PZ_STICKERS = [
    "giphy-9",
    "200w",
    "giphy-3",
    "giphy-8",
    "giphy-4",
    "200-3",
    "giphy-12",
    "200-6",
    "giphy-2",
  ];
  var PZ_PLACAS = [
    ["Diego", "mariokartultrawide"],
    ["Hugo", "galaxys"],
    ["Marcos", "metroid3"],
    [
      "Laura",
      "kirbyultra",
      {
        u:
          U +
          "2026/02/5a258ea9d44361caadaf88344778fe9916bb995f337e91cf88d9a4896a0321fd.webp",
        c: "#ec4899",
        bg: "linear-gradient(135deg,#ffd0b8 0%,#f58bb9 48%,#c9429d 100%)",
      },
    ],
    ["Jorge", "samus1"],
    ["Dani", "zeldita4k"],
    ["Angel", "crossing"],
    ["Fer", "mariofondo"],
  ];
  function plazaShowcase() {
    var box = $("[data-plaza-show]");
    if (box.childElementCount) return;
    var avs = guestList();
    function row(cls, dur, items) {
      var r = el("div", "pz-row pz-row--" + cls),
        t = el("div", "pz-track");
      t.style.animationDuration = dur + "s";
      items.concat(items).forEach(function (n) {
        t.appendChild(n.cloneNode(!0));
      });
      r.appendChild(t);
      box.appendChild(r);
    }
    function tile(src) {
      var d = el("span", "pz-tile"),
        im = el("img");
      im.src = src;
      im.alt = "";
      im.loading = "lazy";
      im.decoding = "async";
      im.draggable = !1;
      d.appendChild(im);
      return d;
    }
    row(
      "sello",
      32,
      PZ_SELLOS.map(function (n) {
        return tile(U + "2026/10/" + n + ".webp");
      }),
    );
    row(
      "placa",
      46,
      PZ_PLACAS.map(function (p, i) {
        var d = el("span", "pz-placa");
        d.style.backgroundImage = 'url("' + U + "2026/10/" + p[1] + '.webp")';
        var a = p[2] || avs[i % avs.length];
        var av = el("span", "pz-av-c");
        paintAv(av, {
          avatar: a.u,
          background: a.bg,
          color: a.c,
          full: a.full,
        });
        d.appendChild(av);
        d.appendChild(el("i"));
        d.appendChild(el("b", "", p[0]));
        return d;
      }),
    );
    row(
      "stk",
      38,
      PZ_STICKERS.map(function (n) {
        return tile(U + "2026/10/" + n + ".webp");
      }),
    );
    box.appendChild(el("span", "pz-show-chapa", "+19.500 miembros"));
  }
  function plazaStage(main, minis, chapa, isNew) {
    var box = $("[data-plaza-av]"),
      stage = $(".pz-stage"),
      show = main === "guest";
    stage.classList.toggle("is-show", show);
    $("[data-plaza-show]").hidden = !show;
    if (show) {
      plazaShowcase();
      return;
    }
    paintAv(box, main || ME || {});
    $$("[data-plaza-mini]").forEach(function (m, i) {
      var p = minis && minis[i];
      m.hidden = !p;
      if (p) paintAv(m.querySelector(".pz-av-c"), p);
    });
    var c = $("[data-plaza-chapa]");
    c.textContent = chapa;
    c.classList.toggle("is-new", !!isNew);
  }
  function setOnline(n) {
    var o = $("[data-online]");
    if (!(n > 0)) {
      o.hidden = !0;
      return;
    }
    o.hidden = !1;
    o.querySelector("span").textContent =
      n === 1 ? "1 conectado" : n + " conectados";
  }
  var PLAZA_SUM = "";
  var PZ_CHAT_STICKERS = {
    "luigi-hola": ["2026/10/giphy-9.webp", "Luigi saluda", "mario"],
    mario: ["2026/10/200w.webp", "Mario", "mario"],
    "mario-elefante": ["2026/10/giphy-11.webp", "Mario elefante", "mario"],
    luigi: ["2026/10/giphy-3.webp", "Luigi", "mario"],
    peach: ["2026/10/giphy-6.webp", "Peach", "mario"],
    "peach-flor": ["2026/10/giphy-8.webp", "Peach con flor", "mario"],
    "peach-rosa": ["2026/10/200-1.webp", "Peach", "mario"],
    toad: ["2026/10/giphy-10.webp", "Toad", "mario"],
    toadette: ["2026/10/giphy-7.webp", "Toadette", "mario"],
    yoshi: ["2026/10/giphy-4.webp", "Yoshi", "mario"],
    bowser: ["2026/10/200-2.webp", "Bowser", "mario"],
    "bowser-mini": ["2026/10/giphy-5.webp", "Bowser", "mario"],
    pikachu: ["2026/10/200-3.webp", "Pikachu", "pokemon"],
    "pikachu-amor": ["2026/10/200-5.webp", "Pikachu enamorado", "pokemon"],
    squirtle: ["2026/10/giphy-12.webp", "Squirtle", "pokemon"],
    charmander: ["2026/10/giphy-14.webp", "Charmander", "pokemon"],
    snorlax: ["2026/10/200-4.webp", "Snorlax", "pokemon"],
    slowpoke: ["2026/10/200w-1.webp", "Slowpoke", "pokemon"],
    piplup: ["2026/10/giphy-15.webp", "Piplup", "pokemon"],
    wooper: ["2026/10/200w-2.webp", "Wooper", "pokemon"],
    canela: ["2026/10/giphy-18.webp", "Canela", "animal"],
    "tom-nook": ["2026/10/200-6.webp", "Tom Nook", "animal"],
    totakeke: ["2026/10/giphy-17.webp", "Totakeke", "animal"],
    link: ["2026/10/giphy.webp", "Link", "zelda"],
    "link-toon": ["2026/10/200.webp", "Link Toon", "zelda"],
    "link-salvaje": ["2026/10/giphy-1.webp", "Link", "zelda"],
    "link-sonrisa": ["2026/10/giphy-2.webp", "Link sonriente", "zelda"],
    "stk-01": ["2026/10/giphy-5-1.webp", "Sticker", "nuevo"],
    "stk-02": ["2026/10/giphy-6-1.webp", "Sticker", "nuevo"],
    "stk-03": ["2026/10/200-5-1.webp", "Sticker", "nuevo"],
    "stk-04": ["2026/10/200-6-1.webp", "Sticker", "nuevo"],
    "stk-05": ["2026/10/giphy-7-1.webp", "Sticker", "nuevo"],
    "stk-06": ["2026/10/giphy-8-1.webp", "Sticker", "nuevo"],
    "stk-07": ["2026/10/giphy-9-1.webp", "Sticker", "nuevo"],
    "stk-08": ["2026/10/giphy-10-1.webp", "Sticker", "nuevo"],
    "stk-09": ["2026/10/200-7.webp", "Sticker", "nuevo"],
    "stk-10": ["2026/10/200-8.webp", "Sticker", "nuevo"],
    "stk-11": ["2026/10/200-9.webp", "Sticker", "nuevo"],
    "stk-12": ["2026/10/200-10.webp", "Sticker", "nuevo"],
    "stk-13": ["2026/10/200w-3.webp", "Sticker", "nuevo"],
    "stk-14": ["2026/10/200-11.webp", "Sticker", "nuevo"],
    "stk-15": ["2026/10/giphy-13.webp", "Sticker", "nuevo"],
    "stk-16": ["2026/10/200-1-1.webp", "Sticker", "nuevo"],
    "stk-17": ["2026/10/giphy-1-1.webp", "Sticker", "nuevo"],
    "stk-18": ["2026/10/giphy-2-1.webp", "Sticker", "nuevo"],
    "stk-19": ["2026/10/200-2-1.webp", "Sticker", "nuevo"],
    "stk-20": ["2026/10/200-3-1.webp", "Sticker", "nuevo"],
    "stk-21": ["2026/10/200-4-1.webp", "Sticker", "nuevo"],
    "stk-22": ["2026/10/giphy-3-1.webp", "Sticker", "nuevo"],
    "stk-23": ["2026/10/giphy-4-1.webp", "Sticker", "nuevo"],
  };
  var PZ_CHAT_STAMPS = Object.create(null);
  [
    [
      "mariook",
      "Mario: ¡genial!",
      "alegria",
      "bien vale si like ok pulgar",
      "stamp_01000q",
    ],
    [
      "marioguino",
      "Mario guiña",
      "alegria",
      "guiño vamos animo musica",
      "stamp_0100u",
    ],
    [
      "luigihola",
      "Luigi saluda",
      "alegria",
      "hola saludo adios",
      "stamp_02000u",
    ],
    [
      "luigibien",
      "Luigi contento",
      "alegria",
      "alegria bien genial fuerza",
      "stamp_02001u",
    ],
    [
      "peachguino",
      "Peach guiña",
      "alegria",
      "guiño porfa amor gracias",
      "stamp_03001u",
    ],
    [
      "daisyhola",
      "Daisy animada",
      "alegria",
      "hola alegria guiño",
      "stamp_04001u",
    ],
    [
      "yoshi",
      "Yoshi feliz",
      "alegria",
      "feliz alegria contento",
      "stamp_07000u",
    ],
    [
      "yoshirosa",
      "Yoshi rosa",
      "alegria",
      "emocion yupi fiesta",
      "stamp_00014u",
    ],
    ["toadfeliz", "Toad contento", "alegria", "feliz hola alegria", "stamp1-1"],
    ["toad", "Toad anima", "alegria", "animo bien vamos", "stamp_09000u"],
    [
      "toadrisa",
      "Toad se ríe",
      "alegria",
      "risa jaja gracioso",
      "stamp_00037u",
    ],
    ["lakitu", "Lakitu saluda", "alegria", "hola nube saludo", "stamp_00004u"],
    [
      "koopa",
      "Koopa con fuerza",
      "alegria",
      "animo fuerza vamos",
      "stamp_00027u",
    ],
    ["spike", "Spike contento", "alegria", "alegria feliz", "stamp3"],
    [
      "birdo",
      "Birdo enamorada",
      "alegria",
      "amor corazon beso",
      "stamp_13000u",
    ],
    [
      "estrella",
      "Superestrella",
      "alegria",
      "estrella genial top brillo",
      "stamp_00012u",
    ],
    ["boo", "Boo se ríe", "alegria", "risa jaja burla", "stamp4"],
    [
      "mariowow",
      "Mario alucina",
      "sorpresa",
      "sorpresa wow que",
      "stamp_01002u",
    ],
    [
      "luigiuy",
      "Luigi nervioso",
      "sorpresa",
      "nervios uy miedo",
      "stamp_02002u",
    ],
    ["peachoh", "Peach sorprendida", "sorpresa", "sorpresa oh", "stamp_03002u"],
    ["daisywow", "Daisy alucina", "sorpresa", "sorpresa wow", "stamp_04002u"],
    [
      "estela",
      "Estela preocupada",
      "sorpresa",
      "sorpresa preocupada ay",
      "stamp_11002u",
    ],
    ["kamek", "Kamek asustado", "sorpresa", "susto sorpresa", "stamp_00026u"],
    [
      "blooper",
      "Blooper confundido",
      "sorpresa",
      "duda pregunta confuso que",
      "stamp_00010u",
    ],
    ["grito", "Spike grita", "sorpresa", "grito miedo susto", "stamp2"],
    [
      "bostezo",
      "Koopa bosteza",
      "sorpresa",
      "sueño cansado aburrido",
      "stamp_53001u",
    ],
    [
      "pinguino",
      "Pingüino llorando",
      "enfado",
      "llorar triste risa lagrimas",
      "stamp_00036u",
    ],
    [
      "toadtriste",
      "Toad triste",
      "enfado",
      "triste llorar pena",
      "stamp_09002u",
    ],
    [
      "wario",
      "Wario frustrado",
      "enfado",
      "rabia frustrado agobio",
      "stamp_05002u",
    ],
    ["bowsy", "Bowsy enfadado", "enfado", "enfado grr rabia", "stamp5"],
    ["golpe", "¡Golpe!", "enfado", "enfado pelea pum golpe", "stamp_00019u"],
    ["enfadado", "Muy enfadado", "enfado", "enfado rabia grr", "stamp_00021u"],
  ].forEach(function (s) {
    PZ_CHAT_STAMPS[s[0]] = [s[1], s[4]];
  });
  var PZ_CHAT_ICONS = {
    sonrisa: {
      name: "Sonrisa",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.4" fill="#ffcf3f"/><circle cx="12" cy="12" r="10.4" fill="none" stroke="#eea21b" stroke-width="1.1"/><ellipse cx="8.6" cy="6.4" rx="3.6" ry="1.9" fill="#fff" opacity=".38"/><ellipse cx="8.7" cy="10.2" rx="1.25" ry="1.75" fill="#5a3714"/><ellipse cx="15.3" cy="10.2" rx="1.25" ry="1.75" fill="#5a3714"/><path d="M7.6 14.2c1.1 2.2 2.8 3.2 4.4 3.2s3.3-1 4.4-3.2" fill="none" stroke="#5a3714" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    },
    risa: {
      name: "Risa",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.4" fill="#ffcf3f"/><circle cx="12" cy="12" r="10.4" fill="none" stroke="#eea21b" stroke-width="1.1"/><ellipse cx="8.6" cy="6.4" rx="3.6" ry="1.9" fill="#fff" opacity=".38"/><path d="M6.6 8.6l2.6 1.3-2.6 1.3M17.4 8.6l-2.6 1.3 2.6 1.3" fill="none" stroke="#5a3714" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.4 13.2h11.2c0 3.3-2.5 5.6-5.6 5.6s-5.6-2.3-5.6-5.6z" fill="#5a3714"/><path d="M8.9 17.1c.8.6 1.9.9 3.1.9s2.3-.3 3.1-.9c-.6-.9-1.8-1.5-3.1-1.5s-2.5.6-3.1 1.5z" fill="#ff6b6b"/><path d="M3.4 11.2c-1 1.5-1.2 2.8-.4 3.4.8.6 1.9 0 2.1-1.5z" fill="#4fc3f7"/><path d="M20.6 11.2c1 1.5 1.2 2.8.4 3.4-.8.6-1.9 0-2.1-1.5z" fill="#4fc3f7"/></svg>',
    },
    guino: {
      name: "Guiño",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.4" fill="#ffcf3f"/><circle cx="12" cy="12" r="10.4" fill="none" stroke="#eea21b" stroke-width="1.1"/><ellipse cx="8.6" cy="6.4" rx="3.6" ry="1.9" fill="#fff" opacity=".38"/><ellipse cx="8.7" cy="10.2" rx="1.25" ry="1.75" fill="#5a3714"/><path d="M13.9 10.4c.9-1 2.3-1 3.2 0" fill="none" stroke="#5a3714" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.6 14.2c1.1 2.2 2.8 3.2 4.4 3.2s3.3-1 4.4-3.2" fill="none" stroke="#5a3714" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 16.3c.4 1.4 1.4 2 2.3 1.6.8-.4.9-1.4.4-2.4z" fill="#ff6b6b"/></svg>',
    },
    enamorado: {
      name: "Enamorado",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.4" fill="#ffcf3f"/><circle cx="12" cy="12" r="10.4" fill="none" stroke="#eea21b" stroke-width="1.1"/><ellipse cx="8.6" cy="6.4" rx="3.6" ry="1.9" fill="#fff" opacity=".38"/><path d="M8.7 12.6 6.3 10.3a1.5 1.5 0 0 1 2.4-1.9 1.5 1.5 0 0 1 2.4 1.9z" fill="#ff3b5c"/><path d="M15.3 12.6l-2.4-2.3a1.5 1.5 0 0 1 2.4-1.9 1.5 1.5 0 0 1 2.4 1.9z" fill="#ff3b5c"/><path d="M7.6 14.2c1.1 2.2 2.8 3.2 4.4 3.2s3.3-1 4.4-3.2" fill="none" stroke="#5a3714" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    },
    guay: {
      name: "Guay",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.4" fill="#ffcf3f"/><circle cx="12" cy="12" r="10.4" fill="none" stroke="#eea21b" stroke-width="1.1"/><ellipse cx="8.6" cy="6.4" rx="3.6" ry="1.9" fill="#fff" opacity=".38"/><path d="M4.3 8.6h15.4v1.3c0 2-1.5 3.5-3.4 3.5h-1.2c-1.6 0-2.9-1.2-3.1-2.7-.2 1.5-1.5 2.7-3.1 2.7H7.7c-1.9 0-3.4-1.5-3.4-3.5z" fill="#23303a"/><path d="M6.4 9.6h2.3M14.6 9.6h2.3" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".7"/><path d="M9 15.6c1.6 1.2 4.3 1.3 6.2-.4" fill="none" stroke="#5a3714" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    },
    sorpresa: {
      name: "Sorpresa",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.4" fill="#ffcf3f"/><circle cx="12" cy="12" r="10.4" fill="none" stroke="#eea21b" stroke-width="1.1"/><ellipse cx="8.6" cy="6.4" rx="3.6" ry="1.9" fill="#fff" opacity=".38"/><path d="M6.8 7.2c.7-.8 1.8-1.1 2.8-.8M17.2 7.2c-.7-.8-1.8-1.1-2.8-.8" fill="none" stroke="#5a3714" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8.7" cy="10.4" r="1.5" fill="#5a3714"/><circle cx="15.3" cy="10.4" r="1.5" fill="#5a3714"/><ellipse cx="12" cy="16" rx="2.2" ry="2.7" fill="#5a3714"/></svg>',
    },
    triste: {
      name: "Triste",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.4" fill="#ffcf3f"/><circle cx="12" cy="12" r="10.4" fill="none" stroke="#eea21b" stroke-width="1.1"/><ellipse cx="8.6" cy="6.4" rx="3.6" ry="1.9" fill="#fff" opacity=".38"/><ellipse cx="8.7" cy="10.4" rx="1.25" ry="1.75" fill="#5a3714"/><ellipse cx="15.3" cy="10.4" rx="1.25" ry="1.75" fill="#5a3714"/><path d="M8.2 17.2c1-1.5 2.3-2.2 3.8-2.2s2.8.7 3.8 2.2" fill="none" stroke="#5a3714" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.6 11.8c-1 1.4-1.2 2.5-.5 3.1.7.5 1.7 0 1.9-1.3z" fill="#4fc3f7"/></svg>',
    },
    enfado: {
      name: "Enfado",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.4" fill="#ff7046"/><circle cx="12" cy="12" r="10.4" fill="none" stroke="#e0452a" stroke-width="1.1"/><ellipse cx="8.6" cy="6.4" rx="3.6" ry="1.9" fill="#fff" opacity=".3"/><path d="M6.3 8.2l3.6 1.6M17.7 8.2l-3.6 1.6" stroke="#4a1405" stroke-width="1.7" stroke-linecap="round"/><ellipse cx="8.8" cy="11.4" rx="1.2" ry="1.5" fill="#4a1405"/><ellipse cx="15.2" cy="11.4" rx="1.2" ry="1.5" fill="#4a1405"/><path d="M8.4 17.2c1-1.3 2.2-1.9 3.6-1.9s2.6.6 3.6 1.9" fill="none" stroke="#4a1405" stroke-width="1.6" stroke-linecap="round"/></svg>',
    },
    dormido: {
      name: "Dormido",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.4" fill="#ffcf3f"/><circle cx="12" cy="12" r="10.4" fill="none" stroke="#eea21b" stroke-width="1.1"/><ellipse cx="8.6" cy="6.4" rx="3.6" ry="1.9" fill="#fff" opacity=".38"/><path d="M7.2 10.6c.9.8 2.2.8 3.1 0M13.7 10.6c.9.8 2.2.8 3.1 0" fill="none" stroke="#5a3714" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="12" cy="16" rx="1.6" ry="1.3" fill="#5a3714"/><path d="M16.2 2.6h3.4l-3.4 3.6h3.4" fill="none" stroke="#5c7cfa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    },
    corazon: {
      name: "Corazón",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21.2S3.4 16 3.4 9.9A4.9 4.9 0 0 1 12 6.6a4.9 4.9 0 0 1 8.6 3.3C20.6 16 12 21.2 12 21.2z" fill="#ff3b5c"/><path d="M12 21.2S3.4 16 3.4 9.9A4.9 4.9 0 0 1 12 6.6" fill="none" stroke="#d81b45" stroke-width="1" opacity=".5"/><path d="M6.6 9.1c.5-1 1.5-1.6 2.6-1.6" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".75"/></svg>',
    },
    megusta: {
      name: "Me gusta",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2.6" y="10.4" width="4" height="10.4" rx="1.3" fill="#3b82f6"/><path d="M7.8 20.8V10.9l4.1-6.5c.6-.9 2-.6 2.2.5.2.9 0 1.9-.3 2.7l-.8 2.3h5.1a2.1 2.1 0 0 1 2.1 2.5l-1.3 6.5a2.5 2.5 0 0 1-2.5 2H7.8z" fill="#ffcf3f" stroke="#eea21b" stroke-width="1.1" stroke-linejoin="round"/></svg>',
    },
    hola: {
      name: "Hola",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="#ffcf3f" stroke="#eea21b" stroke-width="1"><rect x="6.2" y="4.6" width="2.8" height="10" rx="1.4"/><rect x="9.3" y="2.8" width="2.8" height="11" rx="1.4"/><rect x="12.4" y="3.4" width="2.8" height="10.6" rx="1.4"/><rect x="15.5" y="5.4" width="2.8" height="9" rx="1.4"/><path d="M6.2 11.5h12.1v3.3c0 3.6-2.7 6.4-6 6.4s-6.1-2.8-6.1-6.4z"/><rect x="2.6" y="11.6" width="2.8" height="7" rx="1.4" transform="rotate(-38 4 15.1)"/></g><path d="M20.4 3.6c1 .9 1.6 2.1 1.6 3.4M2.6 4.4c.7-1 1.7-1.6 2.8-1.8" fill="none" stroke="#4fc3f7" stroke-width="1.4" stroke-linecap="round"/></svg>',
    },
    fuego: {
      name: "Fuego",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 22.2c-4.4 0-7.6-3-7.6-7.1 0-3.3 2.2-5.4 3.7-7.6.4 1.6 1.3 2.7 2.4 3.3-.3-3.6 1.4-6.6 4.3-8.7-.2 2.9 1 4.6 2.6 6.4 1.4 1.6 2.6 3.5 2.6 6.5 0 4.1-3.2 7.2-8 7.2z" fill="#ff6a1a"/><path d="M12 22.2c-2.4 0-4.1-1.6-4.1-3.8 0-2 1.3-3.2 2.4-4.6.3 1 .9 1.7 1.6 2.1 0-1.9.8-3.4 2.1-4.6.1 1.6.7 2.7 1.5 3.7.7.9 1.1 1.9 1.1 3.2 0 2.3-1.9 4-4.6 4z" fill="#ffd23f"/></svg>',
    },
    estrella: {
      name: "Estrella",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2.4l2.9 6.1 6.7.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6-4.9-4.6 6.7-.8z" fill="#ffd23f" stroke="#eea21b" stroke-width="1.1" stroke-linejoin="round"/><path d="M9.3 9.5l2-.3.9-1.8" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".8"/></svg>',
    },
    rayo: {
      name: "Rayo",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13.6 1.8 4.8 13.4h6.1L9.4 22.2l9.8-12.6h-6.2z" fill="#ffd23f" stroke="#eea21b" stroke-width="1.1" stroke-linejoin="round"/></svg>',
    },
    check: {
      name: "Hecho",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.2" fill="#3fbf5a"/><path d="m7.3 12.3 3.1 3.1 6.3-6.6" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    },
    cruz: {
      name: "No",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.2" fill="#ff4d4f"/><path d="M8.3 8.3l7.4 7.4M15.7 8.3l-7.4 7.4" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>',
    },
    cien: {
      name: "Cien",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text x="12" y="14.6" text-anchor="middle" font-family="Dosis,Arial,sans-serif" font-weight="800" font-size="11.5" fill="#ff3b30" font-style="italic">100</text><path d="M3.6 17.6h16.8M5 20.4h14" stroke="#ff3b30" stroke-width="1.7" stroke-linecap="round"/></svg>',
    },
    ojos: {
      name: "Ojos",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><ellipse cx="7.6" cy="12" rx="4.4" ry="6.4" fill="#fff" stroke="#2b3640" stroke-width="1.2"/><ellipse cx="16.4" cy="12" rx="4.4" ry="6.4" fill="#fff" stroke="#2b3640" stroke-width="1.2"/><ellipse cx="9" cy="12.6" rx="2" ry="2.8" fill="#2b3640"/><ellipse cx="17.8" cy="12.6" rx="2" ry="2.8" fill="#2b3640"/><circle cx="9.6" cy="11.6" r=".7" fill="#fff"/><circle cx="18.4" cy="11.6" r=".7" fill="#fff"/></svg>',
    },
    bocadillo: {
      name: "Mensaje",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 4.2h16a2 2 0 0 1 2 2v9.4a2 2 0 0 1-2 2h-9l-4.6 3.6c-.5.4-1.2 0-1.2-.6v-3H4a2 2 0 0 1-2-2V6.2a2 2 0 0 1 2-2z" fill="#fff" stroke="#3b82f6" stroke-width="1.4" stroke-linejoin="round"/><circle cx="7.6" cy="10.9" r="1.3" fill="#3b82f6"/><circle cx="12" cy="10.9" r="1.3" fill="#3b82f6"/><circle cx="16.4" cy="10.9" r="1.3" fill="#3b82f6"/></svg>',
    },
    gg: {
      name: "GG",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="1.8" y="5" width="20.4" height="14" rx="4.5" fill="#7ac943" stroke="#3fa535" stroke-width="1.2"/><text x="12" y="16.1" text-anchor="middle" font-family="Dosis,Arial,sans-serif" font-weight="800" font-size="10" fill="#fff">GG</text></svg>',
    },
    mando: {
      name: "Mando",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7.2 6.6h9.6a5.4 5.4 0 0 1 5.3 4.6l.5 3.6a3.4 3.4 0 0 1-6 2.7l-1.2-1.4H8.6l-1.2 1.4a3.4 3.4 0 0 1-6-2.7l.5-3.6a5.4 5.4 0 0 1 5.3-4.6z" fill="#5b6cff" stroke="#3f4fd6" stroke-width="1"/><path d="M5.4 10.6h1.5V9.1h1.6v1.5H10v1.6H8.5v1.5H6.9v-1.5H5.4z" fill="#fff"/><circle cx="16.2" cy="9.9" r="1.1" fill="#ffd23f"/><circle cx="18.4" cy="12" r="1.1" fill="#ff5c7a"/><circle cx="14" cy="12" r="1.1" fill="#7ac943"/><circle cx="16.2" cy="14.1" r="1.1" fill="#4fc3f7"/></svg>',
    },
    trofeo: {
      name: "Trofeo",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 3.4h10v5.4a5 5 0 0 1-10 0z" fill="#ffc83d" stroke="#e0950f" stroke-width="1.1"/><path d="M7 5.2H4.2v1.3a3.2 3.2 0 0 0 3.2 3.2M17 5.2h2.8v1.3a3.2 3.2 0 0 1-3.2 3.2" fill="none" stroke="#e0950f" stroke-width="1.4"/><path d="M10.6 13.4h2.8v3.4h-2.8z" fill="#e0950f"/><rect x="7.4" y="16.6" width="9.2" height="3.6" rx="1" fill="#8a5a1d"/><path d="M9.6 5.6v3" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".7"/></svg>',
    },
    moneda: {
      name: "Moneda",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.6" fill="#ffc83d" stroke="#e0950f" stroke-width="1.4"/><ellipse cx="12" cy="12" rx="3" ry="6.2" fill="#ffe27a" stroke="#e0950f" stroke-width="1.2"/><path d="M6.4 7.4c.8-1.2 2-2 3.4-2.4" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".7"/></svg>',
    },
    seta: {
      name: "Seta",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2.4 12.6C2.4 7.1 6.7 3 12 3s9.6 4.1 9.6 9.6c0 1-.8 1.6-1.8 1.6H4.2c-1 0-1.8-.6-1.8-1.6z" fill="#ff3b30" stroke="#d1261c" stroke-width="1"/><circle cx="12" cy="7.2" r="2.4" fill="#fff"/><circle cx="5.9" cy="10.6" r="1.7" fill="#fff"/><circle cx="18.1" cy="10.6" r="1.7" fill="#fff"/><path d="M7.6 14.2h8.8v3.6a4 4 0 0 1-4 4h-.8a4 4 0 0 1-4-4z" fill="#fff1d6" stroke="#e2bf8f" stroke-width="1"/></svg>',
    },
    corona: {
      name: "Corona",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 8.2l4.6 3.6L12 4.6l4.4 7.2L21 8.2l-1.8 10.4H4.8z" fill="#ffc83d" stroke="#e0950f" stroke-width="1.1" stroke-linejoin="round"/><rect x="4.8" y="17.2" width="14.4" height="2.8" rx=".8" fill="#e0950f"/><circle cx="12" cy="13.6" r="1.4" fill="#ff3b5c"/><circle cx="7.6" cy="14.6" r="1" fill="#4fc3f7"/><circle cx="16.4" cy="14.6" r="1" fill="#7ac943"/></svg>',
    },
    regalo: {
      name: "Regalo",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="3.4" y="9.6" width="17.2" height="11" rx="1.6" fill="#ff5ca8"/><rect x="2.4" y="7" width="19.2" height="3.6" rx="1.2" fill="#ff7bbd"/><path d="M10.6 7h2.8v13.6h-2.8z" fill="#ffd23f"/><path d="M12 7c-1.4-3.3-5.3-3.9-5.5-1.7C6.3 7 9.6 7 12 7zm0 0c1.4-3.3 5.3-3.9 5.5-1.7.2 1.7-3.1 1.7-5.5 1.7z" fill="none" stroke="#ffd23f" stroke-width="1.5"/></svg>',
    },
    fiesta: {
      name: "Fiesta",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 21l4.4-12.3 7.9 7.9z" fill="#ffc83d" stroke="#e0950f" stroke-width="1" stroke-linejoin="round"/><path d="M5.4 15.2l3.4 3.4M6.6 11.8l5.6 5.6" stroke="#ff5ca8" stroke-width="1.4"/><path d="M13.4 4.2c.6 1.6.2 3-1 4M19.8 10.6c-1.6-.6-3-.2-4 1" fill="none" stroke="#5b6cff" stroke-width="1.5" stroke-linecap="round"/><circle cx="17" cy="4.2" r="1.2" fill="#7ac943"/><circle cx="20" cy="7.2" r="1" fill="#ff5ca8"/><rect x="9.3" y="2.4" width="2" height="2" rx=".4" fill="#4fc3f7" transform="rotate(20 10.3 3.4)"/><rect x="18.6" y="14" width="2" height="2" rx=".4" fill="#ffd23f" transform="rotate(-20 19.6 15)"/></svg>',
    },
    musica: {
      name: "Música",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 17.6V5.4l11-2.2v12" fill="none" stroke="#9b6bff" stroke-width="2" stroke-linejoin="round"/><ellipse cx="6.6" cy="17.8" rx="3" ry="2.4" fill="#9b6bff"/><ellipse cx="17.6" cy="15.4" rx="3" ry="2.4" fill="#9b6bff"/></svg>',
    },
    campana: {
      name: "Campana",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 3.2a6 6 0 0 1 6 6v4.4l1.8 2.8H4.2L6 13.6V9.2a6 6 0 0 1 6-6z" fill="#ffc83d" stroke="#e0950f" stroke-width="1.1" stroke-linejoin="round"/><path d="M9.6 18.4a2.4 2.4 0 0 0 4.8 0" fill="#e0950f"/><path d="M8.6 8.6c.2-1.4 1.1-2.4 2.3-2.8" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".7"/></svg>',
    },
    hoja: {
      name: "Hoja",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20.4 3.6C9.8 3 3.6 8.4 4 17.2c0 .9.2 1.8.5 2.6 1-3.6 3.6-6.8 7.6-8.8-3 2.4-5 5.4-5.8 8.9C15.4 21.2 21.4 14 20.4 3.6z" fill="#56b83a" stroke="#2f8f2a" stroke-width="1" stroke-linejoin="round"/></svg>',
    },
    burbuja: {
      name: "Burbuja",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#bfe6ff" fill-opacity=".55" stroke="#4fb4ff" stroke-width="1.6"/><path d="M7.6 8.6c.8-1.4 2.2-2.4 3.8-2.6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="16.4" cy="15.6" r="1.1" fill="#fff"/></svg>',
    },
  };
  function livePlazaView() {
    var stage = $(".pz-stage");
    $(".nph-plaza").classList.add("is-live");
    stage.classList.remove("is-show");
    stage.classList.add("is-live");
    stage.removeAttribute("aria-hidden");
    $("[data-plaza-show]").hidden = !0;
    $("[data-plaza-list]").hidden = !0;
    $("[data-plaza-live]").hidden = !1;
    $("[data-plaza-live]").setAttribute("data-plaza-theme", PL.theme);
    plazaTitle([], "");
    $("[data-plaza-cta]").href = URLS.plaza;
    $("[data-plaza-cta] span").textContent = "Ir a la Plaza";
    PLAZA_SUM = "";
  }
  function livePlazaStatus(text, retrying) {
    var status = $("[data-plaza-live-status]");
    if (status.textContent !== text) status.textContent = text;
    status.parentNode.classList.toggle("is-retrying", !!retrying);
  }
  function clearLivePlaza() {
    PL.signature = "";
    $("[data-plaza-feed]").textContent = "";
    $("[data-plaza-empty]").hidden = !1;
    $("[data-plaza-empty]").textContent = "Conectando con la Plaza…";
  }
  function plazaMedia(src, label, cls) {
    var im = el("img", cls);
    im.src = src;
    im.alt = label;
    im.title = label;
    im.loading = "lazy";
    im.decoding = "async";
    im.draggable = !1;
    im.onerror = function () {
      if (im.parentNode)
        im.parentNode.replaceChild(document.createTextNode(label), im);
    };
    return im;
  }
  function livePlazaText(box, message) {
    if (message.x) {
      box.textContent = "Mensaje oculto por el filtro de la Plaza.";
      return;
    }
    var text = String(message.t || ""),
      sticker = text.match(/^:st:([a-z0-9-]+):$/);
    if (sticker) {
      var st = Object.prototype.hasOwnProperty.call(
        PZ_CHAT_STICKERS,
        sticker[1],
      )
        ? PZ_CHAT_STICKERS[sticker[1]]
        : null;
      if (st) box.appendChild(plazaMedia(U + st[0], st[1], "pz-live-sticker"));
      else box.textContent = "Sticker no disponible";
      return;
    }
    var re = /:([a-z0-9_-]+):/g,
      match,
      pos = 0;
    while ((match = re.exec(text))) {
      box.appendChild(document.createTextNode(text.slice(pos, match.index)));
      var stamp = PZ_CHAT_STAMPS[match[1]],
        icon = Object.prototype.hasOwnProperty.call(PZ_CHAT_ICONS, match[1])
          ? PZ_CHAT_ICONS[match[1]]
          : null;
      if (stamp)
        box.appendChild(
          plazaMedia(
            U + "2026/10/" + stamp[1] + ".webp",
            stamp[0],
            "pz-live-stamp",
          ),
        );
      else if (icon)
        box.appendChild(
          plazaMedia(
            "data:image/svg+xml;charset=utf-8," + encodeURIComponent(icon.svg),
            icon.name,
            "pz-live-stamp",
          ),
        );
      else box.appendChild(document.createTextNode(match[0]));
      pos = re.lastIndex;
    }
    box.appendChild(document.createTextNode(text.slice(pos)));
  }
  var PZ_CHAT_RANKS = [
    {
      min: 1,
      nombre: "Joven Promesa",
      a: "#43c943",
      b: "#b6f28c",
      icono: U + "2026/09/jovenpromesayoshi.webp",
    },
    {
      min: 5,
      nombre: "Toad Novato",
      a: "#ff6b6b",
      b: "#ffd6d6",
      icono: U + "2026/09/icontoad.webp",
    },
    {
      min: 10,
      nombre: "Devorador de Estrellas",
      a: "#ff8ec2",
      b: "#ffc2dd",
      icono: U + "2026/09/projectsskirbyss.webp",
    },
    {
      min: 15,
      nombre: "Cazador de Estrellas",
      a: "#ffd54a",
      b: "#ffb13b",
      icono: U + "2026/09/Star-icon.png",
    },
    {
      min: 20,
      nombre: "Vecino Ejemplar de la Isla",
      a: "#86efac",
      b: "#10b981",
      icono: U + "2026/09/ANML.webp",
    },
    {
      min: 25,
      nombre: "Comandante Pikmin",
      a: "#ff5a5a",
      b: "#4d8dff",
      icono: U + "2026/09/Pc049-1.webp",
    },
    {
      min: 30,
      nombre: "Entrenador Pokémon",
      a: "#ffd54a",
      b: "#ff4d4d",
      icono: U + "2026/09/charitrofeo.webp",
    },
    {
      min: 35,
      nombre: "Líder de Gimnasio",
      a: "#f59e0b",
      b: "#fde047",
      icono: U + "2026/09/pokebadge.webp",
    },
    {
      min: 40,
      nombre: "Capitán de la Flota Toad",
      a: "#3b82f6",
      b: "#ff6b6b",
      icono: U + "2026/09/toadcapi.png",
    },
    {
      min: 45,
      nombre: "Héroe del Reino Champiñón",
      a: "#ff4d4d",
      b: "#ff944d",
      icono: U + "2026/09/mario-trofeo.webp",
    },
    {
      min: 50,
      nombre: "Comandante Bowser",
      a: "#ff7a00",
      b: "#dc2626",
      icono: U + "2026/08/ALERTABOWSER.webp",
    },
    {
      min: 55,
      nombre: "Graffitero Novato",
      a: "#facc15",
      b: "#8b5cf6",
      icono: U + "2026/09/S3c010.webp",
    },
    {
      min: 60,
      nombre: "Calamar de Élite",
      a: "#ff3d9a",
      b: "#a0e60a",
      icono: U + "2026/09/splatoon-trofeo.webp",
    },
    {
      min: 65,
      nombre: "Piloto de 200cc",
      a: "#ef4444",
      b: "#facc15",
      icono: U + "2026/09/piloto.webp",
    },
    {
      min: 70,
      nombre: "Rey Ganondorf",
      a: "#b91c1c",
      b: "#f5c542",
      icono: U + "2026/09/SSBU_Ganondorf_Stock.webp",
    },
    {
      min: 75,
      nombre: "Héroe de Hyrule",
      a: "#00a86b",
      b: "#c9a93b",
      icono: U + "2026/09/zelda-trofeo.webp",
    },
    {
      min: 80,
      nombre: "Guardián de la Trifuerza",
      a: "#f9df7b",
      b: "#b8860b",
      icono: U + "2026/09/icons8-trifuerza-96.png",
    },
    {
      min: 85,
      nombre: "Leyenda del Torneo Smash",
      a: "#f43f5e",
      b: "#8b5cf6",
      icono: U + "2026/09/smash.png",
    },
    {
      min: 90,
      nombre: "Rey de la Jungla Kong",
      a: "#c9812f",
      b: "#e0a559",
      icono: U + "2026/09/donkey-trofeo.webp",
    },
    {
      min: 95,
      nombre: "Cazarrecompensas de Élite",
      a: "#ff6a3d",
      b: "#22d3ee",
      icono: U + "2026/09/samus-1.webp",
    },
    {
      min: 100,
      nombre: "Leyenda de Nintendo Project",
      a: "#10b981",
      b: "#8b5cf6",
      icono: U + "2026/09/samus-trofeo.webp",
    },
  ];
  function livePlazaRank(user) {
    var badge = el("span", "pz-live-rank"),
      level = Math.max(0, Math.min(100, Math.floor(+user.nv || 0)));
    badge.hidden = !level;
    if (!level) return badge;
    var rank = PZ_CHAT_RANKS[0];
    PZ_CHAT_RANKS.forEach(function (r) {
      if (level >= r.min) rank = r;
    });
    badge.style.setProperty("--rk-a", rank.a);
    badge.style.setProperty("--rk-b", rank.b);
    badge.title = "Nivel " + level + " · " + rank.nombre;
    var icon = plazaMedia(rank.icono, "", "pz-live-rank-icon");
    icon.onerror = function () {
      icon.onerror = null;
      icon.src = U + "2026/09/Star-icon.png";
    };
    badge.appendChild(icon);
    badge.appendChild(el("b", "", "Nv " + level));
    badge.appendChild(el("span", "", rank.nombre));
    return badge;
  }
  function livePlazaName(user) {
    var name = el("b", "pz-live-name", user.apodo || "Un Mii");
    if (["degradado", "brillo", "neon", "arcoiris"].indexOf(user.ne) >= 0)
      name.classList.add("ne-" + user.ne);
    var color = /^#[0-9a-f]{6}$/i.test(user.nc || "") ? user.nc : user.color;
    if (/^#[0-9a-f]{6}$/i.test(color || "")) {
      var rgb = [1, 3, 5].map(function (i) {
        return parseInt(color.slice(i, i + 2), 16);
      });
      var lum = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
      var dark = PL.theme === "dark";
      if ((dark && lum < 110) || (!dark && lum > 165))
        rgb = rgb.map(function (n) {
          return dark ? n + (255 - n) * 0.45 : n * 0.6;
        });
      color =
        "#" +
        rgb
          .map(function (n) {
            return ("0" + Math.round(n).toString(16)).slice(-2);
          })
          .join("");
      name.style.setProperty("--nc", color);
    }
    return name;
  }
  function livePlazaAvatar(user) {
    var wrap = el("span", "pz-live-avw"),
      av = el("span", "pz-av-c");
    wrap.setAttribute("aria-hidden", "true");
    paintAv(av, user);
    wrap.appendChild(av);
    var deco = el("span", "pz-live-deco");
    deco.setAttribute(
      "data-d",
      ["hojas", "estrellas", "arcoiris", "pokeball", "navi"].indexOf(
        user.deco,
      ) >= 0
        ? user.deco
        : "ninguna",
    );
    wrap.appendChild(deco);
    return wrap;
  }
  function livePlazaReactions(message) {
    var group = el("span", "pz-live-reactions");
    (Array.isArray(message.rx) ? message.rx : []).forEach(function (r) {
      var count = Array.isArray(r.u) ? r.u.length : 0;
      var stamp = PZ_CHAT_STAMPS[r.e],
        icon = Object.prototype.hasOwnProperty.call(PZ_CHAT_ICONS, r.e)
          ? PZ_CHAT_ICONS[r.e]
          : null;
      if (!count || (!stamp && !icon)) return;
      var chip = el("span", "pz-live-reaction");
      chip.classList.toggle(
        "is-mine",
        !!PL.yo &&
          r.u.some(function (id) {
            return +id === +PL.yo.id;
          }),
      );
      chip.classList.toggle("is-super", Array.isArray(r.s) && r.s.length > 0);
      var label = stamp ? stamp[0] : icon.name;
      var src = stamp
        ? U + "2026/10/" + stamp[1] + ".webp"
        : "data:image/svg+xml;charset=utf-8," + encodeURIComponent(icon.svg);
      chip.title =
        label + " · " + count + (count === 1 ? " reacción" : " reacciones");
      chip.appendChild(plazaMedia(src, label, "pz-live-reaction-icon"));
      chip.appendChild(el("b", "", String(count)));
      group.appendChild(chip);
    });
    return group;
  }
  function renderLivePlaza(data) {
    livePlazaView();
    var messages = (Array.isArray(data.mensajes) ? data.mensajes : [])
      .filter(function (m) {
        return m && +m.id > 0;
      })
      .sort(function (a, b) {
        return +a.id - +b.id;
      })
      .slice(-5);
    var users = data.usuarios || {},
      refs = data.refs || {};
    var signature = JSON.stringify([messages, users, refs, PL.theme]);
    livePlazaStatus("En directo", !1);
    if (signature === PL.signature) return;
    var list = $("[data-plaza-feed]"),
      wasEmpty = !list.childElementCount;
    var follow =
      wasEmpty || list.scrollHeight - list.scrollTop - list.clientHeight < 48;
    var scrollTop = list.scrollTop;
    var focus = list.contains(document.activeElement)
      ? document.activeElement.closest("[data-plaza-message]")
      : null;
    var focusId = focus && focus.getAttribute("data-plaza-message");
    PL.signature = signature;
    list.textContent = "";
    messages.forEach(function (m) {
      var user = users[String(m.u)] || {},
        li = el("li", "pz-live-row");
      var a = el("a", "pz-live-message");
      a.href = URLS.plaza;
      a.setAttribute("data-plaza-message", String(+m.id));
      a.appendChild(livePlazaAvatar(user));
      var body = el("span", "pz-live-body"),
        head = el("span", "pz-live-meta");
      head.appendChild(livePlazaName(user));
      head.appendChild(livePlazaRank(user));
      var time = el("time", "", shortTime(+m.ts));
      if (+m.ts > 0 && isFinite(new Date(+m.ts * 1000).getTime()))
        time.dateTime = new Date(+m.ts * 1000).toISOString();
      head.appendChild(time);
      body.appendChild(head);
      var ref = refs[String(m.r)];
      if (+m.r && ref && !ref.b) {
        var author = users[String(ref.u)] || {};
        var reply = el("span", "pz-live-reply");
        reply.appendChild(el("b", "", "↳ " + (author.apodo || "Un Mii")));
        var replyText = el("span");
        livePlazaText(replyText, { t: String(ref.t || "").slice(0, 100) });
        reply.appendChild(replyText);
        body.appendChild(reply);
      }
      var content = el("span", "pz-live-text");
      livePlazaText(content, m);
      body.appendChild(content);
      if (m.sh) body.appendChild(el("small", "pz-live-note", "En revisión"));
      if (m.ed) body.appendChild(el("small", "pz-live-note", "Editado"));
      body.appendChild(livePlazaReactions(m));
      a.appendChild(body);
      li.appendChild(a);
      list.appendChild(li);
    });
    var empty = $("[data-plaza-empty]");
    empty.hidden = messages.length > 0;
    empty.textContent = "La conversación empieza contigo.";
    if (focusId) {
      var nextFocus = list.querySelector(
        '[data-plaza-message="' + focusId + '"]',
      );
      if (nextFocus) nextFocus.focus({ preventScroll: !0 });
    }
    requestAnimationFrame(function () {
      list.scrollTop = follow ? list.scrollHeight : scrollTop;
    });
    scheduleFit();
  }
  function plazaGuest() {
    clearLivePlaza();
    setOnline(0);
    $(".nph-plaza").classList.remove("is-live");
    $(".pz-stage").classList.remove("is-live");
    $(".pz-stage").setAttribute("aria-hidden", "true");
    $("[data-plaza-live]").hidden = !0;
    $("[data-plaza-list]").hidden = !0;
    plazaStage("guest", null, "¡Únete!");
    plazaTitle(
      [
        ["Habla con ", 0],
        ["toda la comunidad", 1],
      ],
      "Inicia sesión para chatear en la Plaza Mii.",
    );
  }
  function plazaWaiting() {
    livePlazaView();
    livePlazaStatus("Reconectando…", !0);
    setOnline(0);
    if (!$("[data-plaza-feed]").childElementCount) {
      $("[data-plaza-empty]").hidden = !1;
      $("[data-plaza-empty]").textContent =
        "No se pudo conectar. Volveremos a intentarlo.";
    }
  }
  function plazaSession() {
    return plazaApi("npmp_init").then(function (d) {
      var previous = PL.yo && +PL.yo.id;
      PL.nonce = d.nonce || "";
      PL.yo = d.yo || null;
      PL.sessionAt = Date.now();
      if (!PL.yo || d.expulsado) {
        PL.yo = null;
        PL.nonce = "";
        PL.stopped = !0;
        plazaGuest();
        return !1;
      }
      PL.theme =
        PL.yo.prefs && ["plaza", "light"].indexOf(PL.yo.prefs.theme) >= 0
          ? "plaza"
          : "dark";
      if (previous !== +PL.yo.id) clearLivePlaza();
      setOnline(d.online ? +d.online.total || 0 : 0);
      return !0;
    });
  }
  function schedulePlazaRefresh(delay) {
    clearTimeout(PL.timer);
    if (!PL.stopped && plazaOn) PL.timer = setTimeout(refreshMsgs, delay);
  }
  function loadPlaza() {
    PL.stopped = !1;
    livePlazaView();
    livePlazaStatus("Conectando…", !0);
    clearTimeout(PL.timer);
    return refreshMsgs(!0);
  }
  function refreshMsgs(preload) {
    if (PL.busy || PL.stopped) return Promise.resolve();
    if (
      !plazaOn ||
      (MOBILE.matches && !SEEN.plazaVis) ||
      prefs.showPlaza === !1 ||
      (!visible && preload !== !0) ||
      document.hidden
    ) {
      clearTimeout(PL.timer);
      return Promise.resolve();
    }
    PL.busy = !0;
    var renewNow = !1;
    var session =
      !PL.nonce || Date.now() - PL.sessionAt > 60000
        ? plazaSession()
        : Promise.resolve(!!PL.yo);
    return session
      .then(function (ok) {
        if (!ok) return;
        return plazaApi("npmp_historial", { antes: "9007199254740991" }).then(
          function (data) {
            renderLivePlaza(data);
            PL.failures = 0;
            PL.authRetries = 0;
          },
        );
      })
      .catch(function (e) {
        PL.failures++;
        if (e.code === "nonce" || e.code === "login") {
          PL.nonce = "";
          PL.yo = null;
          PL.sessionAt = 0;
          clearLivePlaza();
          renewNow = ++PL.authRetries === 1;
        }
        plazaWaiting();
      })
      .then(function () {
        PL.busy = !1;
        schedulePlazaRefresh(
          renewNow
            ? 0
            : PL.failures
              ? Math.min(
                  60000,
                  2000 * Math.pow(2, Math.min(PL.failures - 1, 5)),
                )
              : 6000,
        );
      });
  }
  function wakePlaza() {
    if (!LOGGED || !plazaOn || document.hidden) return;
    if (PL.stopped) PL.sessionAt = 0;
    PL.stopped = !1;
    schedulePlazaRefresh(0);
  }
  document.addEventListener("visibilitychange", wakePlaza);
  addEventListener("focus", wakePlaza);
  addEventListener("np-welcome-done", wakePlaza);
  var POKE_SUM = "";
  function updateSummary() {
    var bits = [];
    if (PLAZA_SUM) bits.push(PLAZA_SUM);
    var t = bits.length
      ? bits.join(" y ").replace(/^(.)/, function (m) {
          return m.toUpperCase();
        }) + "."
      : LOGGED
        ? "Todo está en orden. Esto es lo tuyo de un vistazo."
        : "";
    $("[data-summary]").textContent = t;
    scheduleFit();
  }
  function pokeOn() {
    return prefs.showPoke !== !1 && (!MOBILE.matches || SEEN.poke);
  }
  var pokeStarted = !1,
    pokeBoot = !1;
  function paintPoke() {
    if (!pokeOn()) {
      stopWho();
      POKE_SUM = "";
      return;
    }
    POKE_SUM = renderPoke().summary || "";
    updateSummary();
    scheduleFit();
  }
  var pokeShown = !1;
  function startPoke() {
    var on = pokeOn();
    if (on === pokeShown) return;
    pokeShown = on;
    if (!on) {
      stopWho();
      return;
    }
    $$(".nph-poke img[data-src]").forEach(function (im) {
      im.src = im.getAttribute("data-src");
      im.removeAttribute("data-src");
    });
    loadLocalPoke();
    paintPoke();
    if (!pokeStarted) {
      pokeStarted = !0;
      if (LOGGED) loadServerPoke().then(paintPoke);
    }
  }
  var CONSOLES = [
    {
      name: "Switch 2",
      url: NP.page("roms-para-nintendo-switch-2"),
      icon: NP.u("wp-content/uploads/2026/10/SWITCH2.webp"),
    },
    {
      name: "Switch",
      url: NP.page("roms-para-nintendo-switch"),
      icon: NP.u("wp-content/uploads/2026/10/SWITCH1.webp"),
    },
    {
      name: "Wii U",
      url: NP.page("coleccion-completa-nintendo-wii-u"),
      icon: NP.u("wp-content/uploads/2026/10/WIIU.webp"),
    },
    {
      name: "Wii",
      url: NP.page("coleccion-completa-nintendo-wii"),
      icon: NP.u("wp-content/uploads/2026/10/WII.webp"),
    },
    {
      name: "3DS",
      url: NP.page("coleccion-completa-nintendo-3ds"),
      icon: NP.u("wp-content/uploads/2025/10/3dsnproject.webp"),
    },
    {
      name: "DS",
      url: NP.page("coleccion-completa-nintendo-ds"),
      icon: NP.u("wp-content/uploads/2026/10/DSJUEGOS.webp"),
    },
    {
      name: "GameCube",
      url: NP.page("coleccion-completa-nintendo-game-cube"),
      icon: NP.u("wp-content/uploads/2026/10/GAMECUBE.webp"),
    },
    {
      name: "N64",
      url: NP.page("coleccion-completa-nintendo-64"),
      icon: NP.u("wp-content/uploads/2025/11/iconn64vip.png"),
    },
    {
      name: "SNES",
      url: NP.page("coleccion-completa-super-nintendo"),
      icon: NP.u("wp-content/uploads/2026/10/SNES.webp"),
    },
    {
      name: "NES",
      url: NP.page("coleccion-completa-nintendo-nes"),
      icon: NP.u("wp-content/uploads/2025/10/nescontroller-nproject.webp"),
    },
    {
      name: "GBA",
      url: NP.page("coleccion-completa-game-boy-advance"),
      icon: NP.u("wp-content/uploads/2026/10/GBA.webp"),
    },
    {
      name: "Game Boy Color",
      url: NP.page("coleccion-completa-nintendo-game-boy"),
      icon: NP.u("wp-content/uploads/2025/11/consolas-nintendoprojectvip.webp"),
    },
    {
      name: "PS5",
      url: NP.page("coleccion-completa-playstation-5"),
      icon: NP.u("wp-content/uploads/2026/10/PS5.webp"),
    },
    {
      name: "PS4",
      url: NP.page("coleccion-completa-playstation-4"),
      icon: NP.u("wp-content/uploads/2026/10/PS4.webp"),
    },
    {
      name: "PS3",
      url: NP.page("coleccion-completa-playstation-3"),
      icon: NP.u("wp-content/uploads/2026/10/PS3.webp"),
    },
    {
      name: "PS2",
      url: NP.page("coleccion-completa-playstation-2"),
      icon: NP.u("wp-content/uploads/2026/10/PS2.webp"),
    },
    {
      name: "PS1",
      url: NP.page("coleccion-completa-playstation-1"),
      icon: NP.u("wp-content/uploads/2026/10/PSX-1.webp"),
    },
    {
      name: "PS Vita",
      url: NP.page("coleccion-completa-ps-vita"),
      icon: NP.u("wp-content/uploads/2025/11/icons8-playstation-480.png"),
    },
    {
      name: "PSP",
      url: NP.page("coleccion-completa-psp"),
      icon: NP.u("wp-content/uploads/2026/10/PSP-1.webp"),
    },
    {
      name: "Xbox One",
      url: NP.page("coleccion-completa-xbox-one"),
      icon: NP.u("wp-content/uploads/2026/10/XBOXONE.png"),
    },
    {
      name: "Xbox 360",
      url: NP.page("coleccion-completa-xbox-360"),
      icon: NP.u("wp-content/uploads/2026/10/x360.webp"),
    },
    {
      name: "Dreamcast",
      url: NP.page("coleccion-completa-sega-dreamcast"),
      icon: NP.u("wp-content/uploads/2026/10/DREAMCAST.webp"),
    },
    {
      name: "Mega Drive",
      url: NP.page("coleccion-completa-sega-genesis-megadrive"),
      icon: NP.u("wp-content/uploads/2026/10/GENESIS.webp"),
    },
    {
      name: "PC",
      url: NP.page("multi-nintendo-project-juegos-pc"),
      icon: NP.u("wp-content/uploads/2026/10/PCGAMES.webp"),
    },
  ];
  (function () {
    var row = $("[data-consoles-row]"),
      wrap = $("[data-consoles]");
    function show() {
      if (typeof window.npTopJump !== "function") return;
      if (row.childElementCount) return;
      CONSOLES.forEach(function (c) {
        var a = el("button", "nph-cs");
        a.type = "button";
        a.setAttribute("data-url", c.url);
        a.title = c.name;
        a.setAttribute("aria-label", "Ir al Top de " + c.name);
        var im = el("img");
        im.src = c.icon;
        im.alt = "";
        im.loading = "lazy";
        im.decoding = "async";
        a.appendChild(im);
        row.appendChild(a);
      });
      wrap.hidden = !1;
      setTimeout(arrows, 30);
    }
    var car = $(".nph-cs-car"),
      prev = $(".nph-cs-arr.prev"),
      next = $(".nph-cs-arr.next");
    function arrows() {
      var max = row.scrollWidth - row.clientWidth;
      car.classList.toggle("fits", max <= 2);
      prev.disabled = row.scrollLeft <= 2;
      next.disabled = row.scrollLeft >= max - 2;
    }
    row.addEventListener("scroll", arrows, { passive: !0 });
    addEventListener("resize", arrows, { passive: !0 });
    setTimeout(arrows, 50);
    addEventListener("load", arrows);
    car.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cs-go]");
      if (!b) return;
      row.scrollBy({
        left: +b.getAttribute("data-cs-go") * row.clientWidth * 0.8,
        behavior: RM ? "auto" : "smooth",
      });
      sfx("click", 0.3);
    });
    row.addEventListener(
      "wheel",
      function (e) {
        if (!e.deltaX && !e.shiftKey) return;
        e.preventDefault();
        scrollBy(0, e.deltaY || 0);
      },
      { passive: !1 },
    );
    var dg = null,
      moved = !1;
    row.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dg = { x: e.clientX, l: row.scrollLeft };
      moved = !1;
    });
    addEventListener(
      "pointermove",
      function (e) {
        if (!dg) return;
        var dx = e.clientX - dg.x;
        if (!moved && Math.abs(dx) > 5) {
          moved = !0;
          row.classList.add("drag");
        }
        if (moved) row.scrollLeft = dg.l - dx;
      },
      { passive: !0 },
    );
    addEventListener("pointerup", function () {
      if (!dg) return;
      dg = null;
      setTimeout(function () {
        row.classList.remove("drag");
      }, 0);
    });
    row.addEventListener("click", function (e) {
      var a = e.target.closest(".nph-cs");
      if (!a) return;
      if (
        typeof window.npTopJump === "function" &&
        window.npTopJump(a.getAttribute("data-url"))
      )
        sfx("enter", 0.35);
    });
    show();
    setTimeout(function () {
      show();
      scheduleFit();
    }, 0);
    addEventListener("load", function () {
      show();
      scheduleFit();
    });
  })();
  var cfgBtn = $("[data-open-cfg]"),
    bd = $(".np-cfg-backdrop"),
    dr = $(".np-cfg-drawer");
  var swWrap = $(".np-swatches"),
    vidGrid = $(".np-vidgrid");
  PRESETS.forEach(function (p) {
    var b = el("button", "np-swatch");
    b.type = "button";
    b.setAttribute("data-preset", p.id);
    b.setAttribute("aria-label", "Acento " + p.id);
    b.style.setProperty("--sw", p.c1);
    b.style.setProperty("--sw2", p.c2);
    swWrap.appendChild(b);
  });
  Object.keys(FONDOS).forEach(function (key) {
    var v = FONDOS[key],
      b = el("button", "np-vidcard");
    b.type = "button";
    b.setAttribute("data-video", key);
    var im = el("img", "np-vid-thumb");
    im.setAttribute("data-src", v.img);
    im.alt = "";
    im.decoding = "async";
    b.appendChild(im);
    var tx = el("span", "np-vid-txt");
    tx.appendChild(el("b", "", v.label));
    tx.appendChild(el("small", "", v.sub || ""));
    b.appendChild(tx);
    vidGrid.appendChild(b);
  });
  function markRange() {
    $$("[data-range]", dr).forEach(function (r) {
      var k = r.getAttribute("data-range"),
        v = clamp(Number(prefs[k]) || DEF[k], +r.min, +r.max);
      r.value = v;
      r.style.setProperty(
        "--pct",
        (((v - r.min) / (r.max - r.min)) * 100).toFixed(1) + "%",
      );
      r.setAttribute("aria-valuetext", Math.round(v) + " %");
    });
  }
  function markCfg() {
    markRange();
    $$("[data-seg-theme] button").forEach(function (b) {
      b.classList.toggle(
        "active",
        b.getAttribute("data-theme-v") ===
          (prefs.theme === "light" ? "light" : "dark"),
      );
    });
    $$(".np-swatch").forEach(function (b) {
      b.classList.toggle(
        "active",
        b.getAttribute("data-preset") === prefs.accent,
      );
    });
    $$(".np-vidcard").forEach(function (b) {
      b.classList.toggle(
        "active",
        b.getAttribute("data-video") === prefs.video,
      );
    });
    $$(".np-switch").forEach(function (s) {
      var on = prefs[s.getAttribute("data-sw")] !== !1;
      s.classList.toggle("on", on);
      s.setAttribute("aria-checked", String(on));
    });
  }
  function placeDrawer() {
    var r = root.getBoundingClientRect(),
      H = root.offsetHeight,
      nav = headerNav(),
      topLimit = 0;
    if (nav && !document.documentElement.classList.contains("nph-cfg-open")) {
      var cs = getComputedStyle(nav);
      if (cs.position === "fixed" || cs.position === "sticky") {
        var nb = nav.getBoundingClientRect().bottom;
        if (nb > 0 && nb < innerHeight / 2) topLimit = nb;
      }
    }
    var vt = clamp(topLimit - r.top, 0, H),
      vb = clamp(innerHeight - r.top, 0, H);
    if (vb - vt < 360) {
      vt = 0;
      vb = H;
    }
    if (innerWidth <= 768) {
      dr.style.top = "auto";
      dr.style.maxHeight = Math.round((vb - vt) * 0.92) + "px";
    } else {
      dr.style.top = Math.round(vt) + "px";
      dr.style.maxHeight = "";
    }
    dr.style.bottom = Math.round(H - vb) + "px";
  }
  var lastFocus = null;
  function openCfg() {
    $$("img.np-vid-thumb[data-src]", dr).forEach(function (im) {
      im.src = im.getAttribute("data-src");
      im.removeAttribute("data-src");
    });
    lastFocus = document.activeElement;
    document.documentElement.classList.add("nph-cfg-open");
    markCfg();
    placeDrawer();
    bd.classList.add("open");
    dr.classList.add("open");
    dr.setAttribute("aria-hidden", "false");
    cfgBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("np-panel-open");
    document.documentElement.classList.add("nph-lock");
    sfx("ajustes", 0.6);
    setTimeout(function () {
      var x = $(".np-cfg-close");
      if (x) x.focus({ preventScroll: !0 });
    }, 80);
  }
  function finishClose() {
    document.documentElement.classList.remove("nph-cfg-open");
    bd.classList.remove("open");
    cfgBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("np-panel-open");
    document.documentElement.classList.remove("nph-lock");
    if (lastFocus && lastFocus.focus)
      try {
        lastFocus.focus({ preventScroll: !0 });
      } catch (e) {}
  }
  function closeCfg() {
    if (!dr.classList.contains("open")) return;
    dr.classList.remove("open");
    dr.setAttribute("aria-hidden", "true");
    finishClose();
    sfx("click", 0.4);
  }
  function suckClose() {
    if (RM || prefs.anim === !1) {
      closeCfg();
      return;
    }
    finishClose();
    dr.classList.add("np-suck-close");
    var done = function () {
      dr.classList.remove("np-suck-close", "open");
      dr.setAttribute("aria-hidden", "true");
      dr.removeEventListener("animationend", done);
    };
    dr.addEventListener("animationend", done);
    setTimeout(done, 640);
  }
  cfgBtn.addEventListener("click", function (e) {
    e.preventDefault();
    if (dr.classList.contains("open")) closeCfg();
    else openCfg();
  });
  bd.addEventListener("click", closeCfg);
  $(".np-cfg-close").addEventListener("click", function (e) {
    e.preventDefault();
    closeCfg();
  });
  document.addEventListener(
    "keydown",
    function (e) {
      if (e.key === "Escape" && dr.classList.contains("open")) {
        e.stopPropagation();
        closeCfg();
      }
    },
    !0,
  );
  addEventListener(
    "resize",
    function () {
      if (dr.classList.contains("open")) placeDrawer();
    },
    { passive: !0 },
  );
  function toggleSwitch(s) {
    var k = s.getAttribute("data-sw");
    prefs[k] = prefs[k] === !1;
    savePrefs();
    applyPrefs();
    markCfg();
    sfx("click", 0.35);
    var m = window.NPHomeMusic;
    if (k === "sound") {
      if (prefs.sound === !1) {
        if (m) {
          m.dataset.off = "1";
          m.pause();
        }
      } else homeMusicStart();
    }
  }
  dr.addEventListener("click", function (e) {
    var t;
    if ((t = e.target.closest("[data-seg-theme] button"))) {
      prefs.theme = t.getAttribute("data-theme-v");
    } else if ((t = e.target.closest(".np-swatch"))) {
      var p = PRESETS.filter(function (x) {
        return x.id === t.getAttribute("data-preset");
      })[0];
      prefs.accent = p.id;
      prefs.c1 = p.c1;
      prefs.c2 = p.c2;
    } else if ((t = e.target.closest(".np-vidcard"))) {
      prefs.video = t.getAttribute("data-video");
      var tc =
        TEMA[prefs.video] &&
        PRESETS.filter(function (x) {
          return x.id === TEMA[prefs.video];
        })[0];
      if (tc) {
        prefs.accent = tc.id;
        prefs.c1 = tc.c1;
        prefs.c2 = tc.c2;
      }
      savePrefs();
      applyPrefs();
      markCfg();
      sfx("click", 0.35);
      applySaga(prefs.video);
      if (innerWidth <= 768) setTimeout(suckClose, 160);
      return;
    } else if ((t = e.target.closest(".np-switch"))) {
      toggleSwitch(t);
      return;
    } else if (e.target.closest(".np-cfg-reset")) {
      prefs = {};
      for (var d in DEF) prefs[d] = DEF[d];
      setTimeout(function () {
        applySaga(prefs.video);
      }, 0);
    } else return;
    savePrefs();
    applyPrefs();
    markCfg();
    sfx("click", 0.35);
  });
  var rangeSave = 0;
  dr.addEventListener("input", function (e) {
    var r = e.target.closest && e.target.closest("[data-range]");
    if (!r) return;
    prefs[r.getAttribute("data-range")] = +r.value;
    bgApply();
    markRange();
    clearTimeout(rangeSave);
    rangeSave = setTimeout(savePrefs, 300);
  });
  dr.addEventListener("change", function (e) {
    if (e.target.closest && e.target.closest("[data-range]")) {
      clearTimeout(rangeSave);
      savePrefs();
      sfx("click", 0.3);
    }
  });
  dr.addEventListener("keydown", function (e) {
    var s = e.target.closest && e.target.closest(".np-switch");
    if (s && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      toggleSwitch(s);
    }
  });
  root.addEventListener("click", function (e) {
    var a = e.target.closest(".nph-btn, .pr-btn, .pz-btn, .pz-msg");
    if (!a || a.hasAttribute("data-open-cfg")) return;
    sfx("enter", 0.3);
    if (
      a.href &&
      typeof window.npTopJump === "function" &&
      !e.ctrlKey &&
      !e.metaKey &&
      window.npTopJump(a.href)
    )
      e.preventDefault();
  });
  var MUSIC_URL = U + "2026/10/homeprojectsound.mp3",
    musicWait = !1,
    MUSIC_EVT = ["pointerdown", "touchend", "keydown"];
  function homeMusicStart() {
    if (prefs.sound === !1) return;
    var m = window.NPHomeMusic;
    if (!m) {
      try {
        m = new Audio(MUSIC_URL);
      } catch (e) {
        return;
      }
      m.loop = !0;
      m.volume = 0.2;
      m.preload = "auto";
      window.NPHomeMusic = m;
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) m.pause();
        else if (
          !m.dataset.off &&
          prefs.sound !== !1 &&
          !document.getElementById("npSw2Welcome")
        ) {
          var q = m.play();
          if (q && q.catch) q.catch(musicOnGesture);
        }
      });
    }
    delete m.dataset.off;
    if (!m.paused) return;
    var p = m.play();
    if (p && p.catch) p.catch(musicOnGesture);
  }
  function musicOnGesture() {
    if (musicWait) return;
    musicWait = !0;
    var go = function () {
      musicWait = !1;
      MUSIC_EVT.forEach(function (t) {
        removeEventListener(t, go, !0);
      });
      if (!document.getElementById("npSw2Welcome")) homeMusicStart();
    };
    MUSIC_EVT.forEach(function (t) {
      addEventListener(t, go, !0);
    });
  }
  window.npHomeMusicStart = homeMusicStart;
  function bootMusic() {
    if (!document.getElementById("npSw2Welcome")) homeMusicStart();
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", bootMusic);
  else setTimeout(bootMusic, 0);
  addEventListener("pageshow", function (e) {
    if (e.persisted) bootMusic();
  });
  var SEEN = { poke: !1, plaza: !1, plazaVis: !1 };
  var slTrack = $(".nph-grid"),
    slNav = $("[data-snav]");
  var SL_NAMES = { poke: "Poké Recreo", me: "Tu Mii", plaza: "Plaza Mii" },
    slCur = 0,
    slRaf = 0;
  function slKey(el) {
    return el.classList.contains("nph-poke")
      ? "poke"
      : el.classList.contains("nph-plaza")
        ? "plaza"
        : "me";
  }
  function slList() {
    return [].slice.call(slTrack.children).filter(function (el) {
      return el.offsetWidth > 0;
    });
  }
  function slLeft(el) {
    return el.offsetLeft - (slTrack.clientWidth - el.offsetWidth) / 2;
  }
  function slFit() {
    if (!MOBILE.matches) {
      if (slTrack.style.height) slTrack.style.height = "";
      return;
    }
    var el = slList()[slCur];
    if (!el) return;
    var h = Math.ceil(el.offsetHeight + 18) + "px";
    if (slTrack.style.height !== h) slTrack.style.height = h;
  }
  var slSoundKey = "me",
    slSoundReady = !1;
  function slPrimeSfx() {
    if (slSoundReady || prefs.sound === !1) return;
    slSoundReady = !0;
    ["poke", "plaza"].forEach(function (k) {
      try {
        var a = sfxCache[k] || (sfxCache[k] = new Audio(SFX[k]));
        a.preload = "auto";
        a.load();
      } catch (e) {}
    });
  }
  function slSound(key) {
    if (key === slSoundKey) return;
    slSoundKey = key;
    if (MOBILE.matches && (key === "poke" || key === "plaza")) sfx(key, 0.35);
  }
  function slMark(list, i, user) {
    slCur = i;
    var prev = list[i - 1],
      next = list[i + 1],
      bp = $('[data-sgo="-1"]', slNav),
      bn = $('[data-sgo="1"]', slNav);
    bp.disabled = !prev;
    bn.disabled = !next;
    bp.setAttribute(
      "aria-label",
      prev ? "Ir a " + SL_NAMES[slKey(prev)] : "Anterior",
    );
    bn.setAttribute(
      "aria-label",
      next ? "Ir a " + SL_NAMES[slKey(next)] : "Siguiente",
    );
    slFit();
    var key = slKey(list[i]),
      plazaNow = key === "plaza",
      changed = key !== slSoundKey;
    if (user) slSound(key);
    else slSoundKey = key;
    if (user && changed) slArrive(list[i]);
    if (key === "poke" && !SEEN.poke) {
      SEEN.poke = !0;
      startPoke();
    }
    if (plazaNow && !SEEN.plaza) {
      SEEN.plaza = !0;
      startPlaza();
    }
    if (plazaNow !== SEEN.plazaVis) {
      SEEN.plazaVis = plazaNow;
      if (plazaNow && plazaOn) wakePlaza();
    }
  }
  var slAnimRaf = 0;
  function slScrollTo(left, smooth) {
    cancelAnimationFrame(slAnimRaf);
    slAnimRaf = 0;
    var from = slTrack.scrollLeft,
      d = left - from;
    if (!smooth || Math.abs(d) < 2) {
      slTrack.style.scrollSnapType = "";
      slTrack.scrollLeft = left;
      return;
    }
    var t0 = 0,
      dur = 620;
    slTrack.style.scrollSnapType = "none";
    slAnimRaf = requestAnimationFrame(function step(now) {
      if (!t0) t0 = now;
      var p = Math.min(1, (now - t0) / dur),
        e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      slTrack.scrollLeft = from + d * e;
      if (p < 1) slAnimRaf = requestAnimationFrame(step);
      else {
        slAnimRaf = 0;
        slTrack.style.scrollSnapType = "";
      }
    });
  }
  function slArrive(el) {
    if (!MOBILE.matches || root.getAttribute("data-anim") !== "on") return;
    el.classList.remove("nph-arrive");
    void el.offsetWidth;
    el.classList.add("nph-arrive");
    clearTimeout(el.__arr);
    el.__arr = setTimeout(function () {
      el.classList.remove("nph-arrive");
    }, 1300);
  }
  var slAuto = 0;
  function slGo(i, smooth, user) {
    var list = slList();
    if (!list.length) return;
    i = clamp(i, 0, list.length - 1);
    slAuto = Date.now() + (smooth ? 750 : 120);
    slScrollTo(slLeft(list[i]), smooth && !RM && prefs.anim !== !1);
    slMark(list, i, user);
  }
  function slReset() {
    if (!MOBILE.matches) {
      slFit();
      return;
    }
    var list = slList(),
      me = list.map(slKey).indexOf("me");
    requestAnimationFrame(function () {
      slGo(me < 0 ? 0 : me, !1);
    });
  }
  var slBest = 0,
    slTouch = !1,
    slSettleT = 0;
  function slSettle() {
    clearTimeout(slSettleT);
    if (!MOBILE.matches || slTouch || slAnimRaf) return;
    var list = slList();
    if (!list.length) return;
    if (slBest !== slCur) slMark(list, slBest, Date.now() > slAuto);
    else slFit();
  }
  slTrack.addEventListener(
    "scroll",
    function () {
      if (!MOBILE.matches) return;
      clearTimeout(slSettleT);
      slSettleT = setTimeout(slSettle, 140);
      if (slRaf) return;
      slRaf = requestAnimationFrame(function () {
        slRaf = 0;
        var list = slList(),
          x = slTrack.scrollLeft,
          bd = Infinity;
        list.forEach(function (el, k) {
          var d = Math.abs(slLeft(el) - x);
          if (d < bd) {
            bd = d;
            slBest = k;
          }
        });
      });
    },
    { passive: !0 },
  );
  if ("onscrollend" in window)
    slTrack.addEventListener(
      "scrollend",
      function () {
        requestAnimationFrame(slSettle);
      },
      { passive: !0 },
    );
  slTrack.addEventListener(
    "touchstart",
    function () {
      slTouch = !0;
      slWarm();
    },
    { passive: !0 },
  );
  slTrack.addEventListener(
    "touchend",
    function () {
      slTouch = !1;
      clearTimeout(slSettleT);
      slSettleT = setTimeout(slSettle, 160);
    },
    { passive: !0 },
  );
  slTrack.addEventListener(
    "touchcancel",
    function () {
      slTouch = !1;
      clearTimeout(slSettleT);
      slSettleT = setTimeout(slSettle, 160);
    },
    { passive: !0 },
  );
  function slWarm() {
    if (!MOBILE.matches) return;
    if (!SEEN.poke && prefs.showPoke !== !1) {
      SEEN.poke = !0;
      startPoke();
    }
    if (!SEEN.plaza && prefs.showPlaza !== !1) {
      SEEN.plaza = !0;
      startPlaza();
    }
  }
  (function () {
    var idle =
      window.requestIdleCallback ||
      function (f) {
        return setTimeout(f, 1);
      };
    setTimeout(function () {
      idle(slWarm, { timeout: 2500 });
    }, 2500);
  })();
  slNav.addEventListener("click", function (e) {
    var b = e.target.closest("[data-sgo]");
    if (!b) return;
    slPrimeSfx();
    slGo(slCur + +b.getAttribute("data-sgo"), !0, !0);
    if (slSoundKey === "me") sfx("click", 0.3);
  });
  slTrack.addEventListener("touchstart", slPrimeSfx, { passive: !0, once: !0 });
  var slLastW = innerWidth;
  if ("ResizeObserver" in window) {
    var slRO = new ResizeObserver(function () {
      if (MOBILE.matches && !slTouch) requestAnimationFrame(slFit);
    });
    [].forEach.call(slTrack.children, function (el) {
      slRO.observe(el);
    });
  }
  addEventListener(
    "resize",
    function () {
      if (!MOBILE.matches || innerWidth === slLastW) return;
      slLastW = innerWidth;
      clearTimeout(slReset.t);
      slReset.t = setTimeout(function () {
        if (!slTouch) slGo(slCur, !1);
      }, 150);
    },
    { passive: !0 },
  );
  applyPrefs();
  markCfg();
  renderMe();
  pokeBoot = !0;
  startPoke();
  updateSummary();
  slReset();
  var plazaOn = !1;
  function startPlaza() {
    if (prefs.showPlaza === !1 || (MOBILE.matches && !SEEN.plaza)) return;
    if (plazaOn) {
      if (LOGGED) wakePlaza();
      return;
    }
    plazaOn = !0;
    $$(".nph-plaza img[data-src]").forEach(function (im) {
      im.src = im.getAttribute("data-src");
      im.removeAttribute("data-src");
    });
    if (LOGGED) {
      loadPlaza();
    } else {
      plazaGuest();
      plazaApi("npmp_init")
        .then(function (d) {
          if (d.online) setOnline(+d.online.total || 0);
        })
        .catch(function () {});
    }
  }
  startPlaza();
  function onMobileChange() {
    startPlaza();
    startPoke();
    slReset();
  }
  if (MOBILE.addEventListener)
    MOBILE.addEventListener("change", onMobileChange);
  else if (MOBILE.addListener) MOBILE.addListener(onMobileChange);
  addEventListener("storage", function (e) {
    if (
      pokeOn() &&
      (!e.key || e.key === "pkw_v6" || e.key.indexOf(RC.cache) === 0)
    ) {
      loadLocalPoke();
      paintPoke();
    }
    if (!e.key || e.key === "mii-perfil") renderMe();
    if (!e.key || e.key === PREF_KEY) {
      prefs = loadPrefs();
      applyPrefs();
      markCfg();
    }
  });
  addEventListener("focus", function () {
    if (pokeOn()) {
      loadLocalPoke();
      paintPoke();
    }
  });
  addEventListener("np:pokemon", function () {
    if (pokeOn()) {
      loadLocalPoke();
      paintPoke();
    }
  });
  addEventListener("np:pkw-change", function () {
    if (pokeOn()) {
      loadLocalPoke();
      paintPoke();
    }
  });
  setInterval(function () {
    if (visible && !document.hidden && POKE.S && pokeOn()) paintPoke();
  }, 120000);
})();
