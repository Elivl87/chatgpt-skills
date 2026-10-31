var NP = window.NP;
(function () {
  "use strict";
  if (window.__nswWelcome) return;
  window.__nswWelcome = !0;
  var root = document.getElementById("npHome");
  if (!root || !document.body) return;
  if (
    document.body.classList.contains("elementor-editor-active") ||
    /[?&]elementor-preview=/.test(location.search)
  )
    return;
  var LOGO_URL =
    NP.u("wp-content/uploads/2026/05/LOGOMOBILEPROJECT.webp");
  var html = document.documentElement;
  // Respeta prefers-reduced-motion y la preferencia "anim" del widget.
  var still = !NP.motionOn();
  function cloneClean(el) {
    var c = el.cloneNode(!0);
    c.removeAttribute("id");
    var withId = c.querySelectorAll("[id]");
    for (var i = 0; i < withId.length; i++) withId[i].removeAttribute("id");
    var imgs = c.querySelectorAll("img");
    for (var j = 0; j < imgs.length; j++) imgs[j].loading = "eager";
    return c;
  }
  var HOUR = 60 * 60 * 1000,
    FULL_KEY = "np-intro-full",
    INTRO_KEY = "np-welcome-intro";
  function seenWithin(key, ms) {
    try {
      var o = JSON.parse(localStorage.getItem(key) || "null");
      var d = o && typeof o.t === "number" ? Date.now() - o.t : -1;
      return d >= 0 && d < ms;
    } catch (e) {
      return !1;
    }
  }
  var isGuest = !(window.npUserAvatar && window.npUserAvatar.loggedIn);
  var FULL = isGuest && !seenWithin(FULL_KEY, 12 * HOUR);
  var PRESS = !seenWithin(INTRO_KEY, 24 * HOUR);
  if (!FULL && !PRESS) return;
  // Se marca como "vista" solo cuando la intro se ha pintado de verdad
  // (ver mount()), no antes: si algo falla no se pierde la bienvenida.
  var seenMarked = !1;
  function markSeen() {
    if (seenMarked) return;
    seenMarked = !0;
    try {
      if (FULL)
        localStorage.setItem(FULL_KEY, JSON.stringify({ t: Date.now() }));
      localStorage.setItem(INTRO_KEY, JSON.stringify({ t: Date.now() }));
    } catch (e) {}
  }
  // Estado de salida (declarado pronto para que la vía de escape funcione
  // aunque falle algo a mitad de la inicialización).
  var bailed = !1,
    finished = !1,
    closedSent = !1,
    safetyTimer = 0,
    lastProgress = 0,
    gestured = !1;
  var NV = navigator,
    CONN = NV.connection || NV.mozConnection || NV.webkitConnection || {};
  var saveData =
    CONN.saveData === !0 ||
    /(^|-)2g$/.test(CONN.effectiveType || "") ||
    !!(
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-data: reduce)").matches
    );
  var lowEnd =
    html.classList.contains("np-lite") ||
    (NV.deviceMemory && NV.deviceMemory <= 4) ||
    (NV.hardwareConcurrency && NV.hardwareConcurrency <= 4);
  var showIntro = FULL && !still && !saveData;
  var ov = document.createElement("div");
  ov.id = "npSw2Welcome";
  ov.setAttribute("role", "dialog");
  ov.setAttribute("aria-modal", "true");
  ov.setAttribute("tabindex", "-1");
  if (still) ov.classList.add("nsw-still");
  if (lowEnd) ov.classList.add("nsw-low");
  try {
    if (root) {
      var cs = getComputedStyle(root);
      var a1 = cs.getPropertyValue("--a1").trim(),
        a2 = cs.getPropertyValue("--a2").trim(),
        am = cs.getPropertyValue("--amid").trim();
      if (a1) {
        ov.style.setProperty("--np-accent-1", a1);
        ov.style.setProperty("--npl-neon-cyan", a1);
      }
      if (a2) {
        ov.style.setProperty("--np-accent-2", a2);
        ov.style.setProperty("--npl-neon-red", a2);
      }
      if (am) ov.style.setProperty("--np-accent-mid", am);
    }
  } catch (e) {}
  var LAUREL_G =
    '<path d="M15 46C7 39 4.5 26 8.5 5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
    [
      [8, 40, -50],
      [5, 32, -30],
      [3.8, 24, -14],
      [4.3, 16, 2],
      [6, 9, 18],
      [12.6, 37, 42],
      [10, 29, 32],
      [9.3, 21, 22],
      [10, 13, 28],
    ]
      .map(function (l) {
        return (
          '<ellipse cx="' +
          l[0] +
          '" cy="' +
          l[1] +
          '" rx="2.1" ry="4.2" transform="rotate(' +
          l[2] +
          " " +
          l[0] +
          " " +
          l[1] +
          ')"/>'
        );
      })
      .join("");
  var LAUREL =
    '<svg class="nsw-laurel" viewBox="0 0 20 48" fill="currentColor" aria-hidden="true">' +
    LAUREL_G +
    "</svg>";
  var LAUREL_R =
    '<svg class="nsw-laurel nsw-laurel-r" viewBox="0 0 20 48" fill="currentColor" aria-hidden="true">' +
    LAUREL_G +
    "</svg>";
  var STAR_SVG =
    '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.9L22 9.6l-5.4 4.7 1.7 7.2L12 17.7 5.7 21.5l1.7-7.2L2 9.6l7.1-.7L12 2z"/></svg>';
  ov.innerHTML =
    // Solo posicionamiento y reset de <button>; el aspecto lo dan las hojas
    // compartidas (.np-btn-saltar) y las reglas existentes de .ns-lock-pill.
    "<style>" +
    "#npSw2Welcome .nsw-skip-pos{position:absolute;z-index:20;top:max(14px,env(safe-area-inset-top));right:max(14px,env(safe-area-inset-right))}" +
    "#npSw2Welcome.nsw-exit .nsw-skip-pos{visibility:hidden}" +
    "#npSw2Welcome :where(button.ns-lock-pill){-webkit-appearance:none;appearance:none;border:0;margin:0;font:inherit;color:inherit;text-align:center}" +
    "#npSw2Welcome button.ns-lock-pill:focus-visible{outline:3px solid #fff;outline-offset:4px}" +
    "</style>" +
    '<button type="button" class="np-btn-saltar nsw-skip-pos">Saltar</button>' +
    '<div class="nsw-bg" aria-hidden="true"></div>' +
    '<div class="nsw-qbg" aria-hidden="true"><i style="--c:31,139,255;--k:0"></i><i style="--c:255,59,48;--k:1"></i><i style="--c:37,226,127;--k:2"></i><i style="--c:255,214,10;--k:3"></i><i style="--c:255,92,168;--k:4"></i><i style="--c:167,104,255;--k:5"></i><i style="--c:255,140,46;--k:6"></i></div>' +
    (showIntro
      ? '<div class="nsw-intro" aria-hidden="true"><div class="nsw-track"></div><div class="nsw-intro-flash"></div></div>'
      : "") +
    '<div class="nsw-stage">' +
    '<div class="nsw-logo-box">' +
    '<div class="nsw-logo-move"><img class="nsw-logo" src="' +
    LOGO_URL +
    '" alt="Nintendo Project" decoding="async" fetchpriority="high"></div>' +
    "</div>" +
    '<div class="nsw-quiz" aria-live="polite"></div>' +
    '<div class="nsw-tp-wrap">' +
    '<a href="https://es.trustpilot.com/review/nintendoproject.com" target="_blank" rel="nofollow noopener" class="nsw-tp" aria-label="Trustpilot: 5 estrellas, más de 6.500 reseñas (se abre en una ventana nueva)">' +
    LAUREL +
    '<span class="nsw-md">' +
    '<span class="nsw-md-top nsw-md-stars" aria-hidden="true">' +
    new Array(6).join('<span class="nsw-st">' + STAR_SVG + "</span>") +
    "</span>" +
    '<b class="nsw-md-main">+6.500 reseñas</b>' +
    '<small class="nsw-md-brand">Trustpilot</small>' +
    "</span>" +
    LAUREL_R +
    "</a>" +
    '<a href="https://www.virustotal.com/gui/url/6b80b34417236a3922f96cd09588b24fd10de72743497d97872d3789ca7cabf7" target="_blank" rel="nofollow noopener" class="nsw-tp nsw-vt" aria-label="VirusTotal: la web de juegos número 1 más segura (se abre en una ventana nueva)">' +
    LAUREL +
    '<span class="nsw-md">' +
    '<span class="nsw-md-top" aria-hidden="true"><svg class="nsw-md-shield" viewBox="0 0 24 24"><path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M8.6 12.2l2.4 2.4 4.6-4.8"/></svg><em>#1</em></span>' +
    '<b class="nsw-md-main">Web más segura</b>' +
    '<small class="nsw-md-brand">VirusTotal</small>' +
    "</span>" +
    LAUREL_R +
    "</a>" +
    "</div>" +
    '<div class="nsw-text"></div>' +
    '<div class="nsw-user">' +
    '<div class="nsw-av" aria-hidden="true"></div>' +
    '<div class="nsw-press-wrap">' +
    '<button type="button" class="ns-lock-pill">' +
    '<span class="ns-lock-text" style="display:block">Pulsa 3 veces para entrar</span>' +
    '<span class="ns-lock-dots" aria-hidden="true" style="display:flex"><span class="ns-lock-dot" style="display:block"></span><span class="ns-lock-dot" style="display:block"></span><span class="ns-lock-dot" style="display:block"></span></span>' +
    "</button>" +
    "</div>" +
    "</div>" +
    "</div>";
  var data = window.NPHomeData || {};
  var me = data.me || null;
  var loggedIn = !!(me && window.npUserAvatar && window.npUserAvatar.loggedIn);
  if (FULL && !loggedIn && window.NPHomePrefs) window.NPHomeBgHold = !0;
  var textBox = ov.querySelector(".nsw-text");
  if (loggedIn) {
    var nickName = String(me.name || "")
      .trim()
      .slice(0, 24);
    var blk = document.createElement("div");
    blk.className = "ns-login-welcome-block";
    var tt = document.createElement("p");
    tt.className = "ns-login-welcome-title" + (nickName ? " has-nick" : "");
    var ln = document.createElement("span");
    ln.className = "ns-login-welcome-line";
    ln.innerHTML =
      '<span class="ns-login-welcome-gradient">Bienvenido</span> <span class="ns-login-welcome-rest">De Nuevo</span>';
    tt.appendChild(ln);
    if (nickName) {
      var nk = document.createElement("span");
      nk.className = "ns-login-welcome-nick";
      nk.textContent = nickName;
      tt.appendChild(nk);
    }
    blk.appendChild(tt);
    textBox.appendChild(blk);
    ov.setAttribute(
      "aria-label",
      "Bienvenido de nuevo" +
        (nickName ? ", " + nickName : "") +
        ". Pulsa 3 veces para entrar.",
    );
  } else {
    textBox.parentNode.removeChild(textBox);
    ov.classList.add("nsw-no-text");
    ov.setAttribute(
      "aria-label",
      "Nintendo Project. Pulsa 3 veces para entrar.",
    );
  }
  var avBox = ov.querySelector(".nsw-av");
  var avatarEl = document.createElement("div");
  avatarEl.className = "nsw-me";
  var avCircle = document.createElement("div");
  avCircle.className = "nsw-me-c";
  avatarEl.appendChild(avCircle);
  avBox.appendChild(avatarEl);
  if (loggedIn) {
    var full = !!me.isFull;
    avCircle.classList.toggle("is-full", full);
    if (!full) {
      avCircle.style.backgroundColor = me.color || "#3b82f6";
      if (me.bg) avCircle.style.backgroundImage = me.bg;
    }
    var mi = document.createElement("img");
    mi.alt = "";
    mi.decoding = "async";
    mi.src = me.avatar;
    mi.onerror = function () {
      mi.onerror = null;
      if (data.fallback) mi.src = data.fallback;
    };
    avCircle.appendChild(mi);
    if (data.nivel) {
      var lvb = document.createElement("span");
      lvb.className = "nsw-me-lv";
      lvb.textContent = "Nivel " + data.nivel;
      avatarEl.appendChild(lvb);
    }
  }
  var bg = ov.querySelector(".nsw-bg");
  var bgHost = root.querySelector(".nph-bg");
  var bgParent = bgHost ? bgHost.parentNode : null;
  var bgNext = bgHost ? bgHost.nextSibling : null;
  var vid = bgHost ? bgHost.querySelector("video") : null;
  function playVid() {
    if (!vid || window.NPHomeBgHold) return;
    if (!vid.getAttribute("src")) {
      if (window.NPHomeBg) window.NPHomeBg.play();
      return;
    }
    vid.muted = !0;
    try {
      var p = vid.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }
  var logo = ov.querySelector(".nsw-logo");
  logo.addEventListener("error", function () {
    logo.style.visibility = "hidden";
  });
  var tpBadge = ov.querySelector(".nsw-tp-wrap");
  var logoBox = ov.querySelector(".nsw-logo-box");
  var logoMove = ov.querySelector(".nsw-logo-move");
  var phase = 0,
    timers = [],
    ready = !1;
  function syncWidth() {
    var w = tpBadge ? tpBadge.getBoundingClientRect().width : 0;
    if (w)
      ov.style.setProperty(
        "--nsw-col",
        Math.round(Math.max(w, Math.min(380, window.innerWidth * 0.84))) + "px",
      );
  }
  function centerLogo() {
    var r = logoBox.getBoundingClientRect();
    var dx = window.innerWidth / 2 - (r.left + r.width / 2);
    var dy = window.innerHeight / 2 - (r.top + r.height / 2);
    var s = Math.max(
      1,
      Math.min(1.4, (window.innerWidth * 0.86) / (r.width || 1)),
    );
    logoMove.style.setProperty("--nsw-logo-dx", Math.round(dx) + "px");
    logoMove.style.setProperty("--nsw-logo-dy", Math.round(dy) + "px");
    logoMove.style.setProperty("--nsw-logo-s", s.toFixed(3));
  }
  var measureRaf = 0;
  function remeasure() {
    if (measureRaf) return;
    measureRaf = requestAnimationFrame(function () {
      measureRaf = 0;
      syncWidth();
      if (phase < 2) centerLogo();
    });
  }
  function onLogoSize() {
    if (logo.naturalWidth && logo.naturalHeight)
      ov.style.setProperty(
        "--nsw-logo-ar",
        (logo.naturalWidth / logo.naturalHeight).toFixed(4),
      );
    remeasure();
  }
  if (logo.complete) onLogoSize();
  else logo.addEventListener("load", onLogoSize);
  try {
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(remeasure);
  } catch (e) {}
  function onResize() {
    remeasure();
  }
  window.addEventListener("resize", onResize, { passive: !0 });
  var Snd = (function () {
    var AC = window.AudioContext || window.webkitAudioContext;
    var ctx = null,
      master = null,
      noiseBuf = null;
    // Solo con sonido activado expresamente Y tras un gesto del usuario
    // (gestured se pone a true en los manejadores de clic/tecla/toque).
    function create() {
      if (ctx) return !0;
      if (!AC || !gestured || !NP.soundOn()) return !1;
      try {
        ctx = new AC();
      } catch (e) {
        ctx = null;
        return !1;
      }
      master = ctx.createGain();
      master.gain.value = 0.5;
      var comp = ctx.createDynamicsCompressor();
      master.connect(comp);
      comp.connect(ctx.destination);
      return !0;
    }
    function unlock() {
      if (!create()) return !1;
      if (ctx.state === "suspended") {
        try {
          var r = ctx.resume();
          if (r && r.catch) r.catch(function () {});
        } catch (e) {}
      }
      return !0;
    }
    function running() {
      return !!ctx && ctx.state === "running" && NP.soundOn();
    }
    function tone(f, t0, dur, type, vol, f2) {
      var o = ctx.createOscillator(),
        g = ctx.createGain();
      o.type = type || "sine";
      o.frequency.setValueAtTime(f, t0);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g);
      g.connect(master);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    }
    function noise(t0, dur, vol, fFrom, fTo, q, attack) {
      if (!noiseBuf) {
        noiseBuf = ctx.createBuffer(
          1,
          Math.floor(ctx.sampleRate * 0.8),
          ctx.sampleRate,
        );
        var d = noiseBuf.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      var s = ctx.createBufferSource(),
        bp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      s.buffer = noiseBuf;
      bp.type = "bandpass";
      bp.Q.value = q || 1;
      bp.frequency.setValueAtTime(fFrom, t0);
      bp.frequency.exponentialRampToValueAtTime(fTo, t0 + dur);
      var a = t0 + dur * (attack == null ? 0.3 : attack);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, a);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      s.connect(bp);
      bp.connect(g);
      g.connect(master);
      s.start(t0);
      s.stop(t0 + dur + 0.05);
    }
    var CHORD = [1046.5, 1318.5, 1568, 2093];
    return {
      unlock: unlock,
      tick: function (speed) {
        if (!running()) return;
        var t = ctx.currentTime,
          f = 620 + Math.min(speed, 24) * 32;
        tone(f, t, 0.06, "triangle", 0.16);
        tone(f * 2, t, 0.03, "sine", 0.05);
      },
      reveal: function (force) {
        if (force ? !unlock() : !running()) return;
        var t = ctx.currentTime + 0.02;
        noise(t, 0.7, 0.2, 6000, 350, 0.7, 0.12);
        tone(130.8, t, 1, "sine", 0.22, 98);
        CHORD.forEach(function (f, i) {
          tone(f, t + 0.04 + i * 0.07, 1.5, "sine", 0.13);
          tone(f * 2, t + 0.04 + i * 0.07, 0.6, "sine", 0.025);
        });
      },
      tap: function (n) {
        if (!unlock()) return;
        var t = ctx.currentTime + 0.005;
        var f = [659.25, 783.99, 1046.5][Math.max(0, Math.min(n, 3) - 1)];
        tone(f, t, 0.25, "sine", 0.3);
        tone(f * 2, t, 0.1, "triangle", 0.07);
        noise(t, 0.05, 0.05, 3000, 2000, 1.5, 0.1);
        if (n >= 3) {
          CHORD.forEach(function (ff, i) {
            tone(ff, t + 0.09 + i * 0.045, 0.7, "sine", 0.1);
          });
          noise(t + 0.1, 0.45, 0.1, 700, 7000, 0.8, 0.5);
        }
      },
      close: function () {
        if (!ctx) return;
        var c = ctx;
        ctx = null;
        noiseBuf = null;
        try {
          var r = c.close();
          if (r && r.catch) r.catch(function () {});
        } catch (e) {}
      },
    };
  })();
  var tpTimer = 0;
  [].forEach.call(ov.querySelectorAll(".nsw-tp"), function (a) {
    a.setAttribute("tabindex", "-1");
  });
  var JU = NP.u("wp-content/uploads/2026/10/");
  var JINGLES = {
    mario: "mario_nintendo.mp3",
    zelda: "zelda_secret-1.mp3",
    pokemon: "level_up-1.mp3",
    animal: "animal_crossing_2.mp3",
    donkey: "donkey.mp3",
    kirby: "kirby.mp3",
    metroid: "metroid.mp3",
    splatoon: "splatoon_3_tacticooler.mp3",
    starfox: "star_fox_64_select.mp3",
    xenoblade: "xenoblade_uwu.mp3",
    sonic: "sonic_emerald.mp3",
    playstation: "psp.mp3",
  };
  var jingle = null,
    jingleKey = "",
    jingleDone = !1,
    jingleWait = !1;
  function curUniverse() {
    var v = "";
    try {
      var hp = window.NPHomePrefs && window.NPHomePrefs.get();
      v = hp && hp.video;
    } catch (e) {}
    if (!v) v = NP.prefs().video;
    return typeof v === "string" && NP.has(JINGLES, v) ? v : "mario";
  }
  function prepJingle(k) {
    k = NP.has(JINGLES, k) ? k : "mario";
    if (k === jingleKey && jingle) return;
    jingleKey = k;
    try {
      jingle = new Audio(JU + JINGLES[k]);
      jingle.preload = "auto";
      jingle.volume = 0.5;
    } catch (e) {
      jingle = null;
    }
  }
  var soundOn = NP.soundOn;
  function playJingle() {
    if (loggedIn || jingleDone || done || !soundOn()) return;
    // Nunca suena sin un gesto previo: queda pendiente para el siguiente toque.
    if (!gestured) {
      jingleWait = !0;
      return;
    }
    if (!jingle) prepJingle(pickedSaga || curUniverse());
    if (!jingle) return;
    var p;
    try {
      jingle.currentTime = 0;
      p = jingle.play();
    } catch (e) {
      jingleWait = !0;
      return;
    }
    if (p && p.then)
      p.then(
        function () {
          jingleDone = !0;
          jingleWait = !1;
        },
        function () {
          jingleWait = !0;
        },
      );
    else jingleDone = !0;
  }
  function setPhase(n) {
    lastProgress = Date.now();
    for (var p = phase + 1; p <= n; p++) ov.classList.add("nsw-p" + p);
    if (n > phase) phase = n;
    if (n >= 3) {
      ready = !0;
      useIntroAvatars();
      playJingle();
    }
    if (n >= 2 && !tpTimer && !ov.classList.contains("nsw-tp-ready")) {
      tpTimer = setTimeout(
        function () {
          ov.classList.add("nsw-tp-ready");
          [].forEach.call(ov.querySelectorAll(".nsw-tp"), function (a) {
            a.removeAttribute("tabindex");
          });
        },
        still ? 0 : ov.classList.contains("nsw-skip") ? 450 : 850,
      );
      timers.push(tpTimer);
    }
  }
  var QUIZ_KEY = "np-quiz-done",
    HP = window.NPHomePrefs;
  var SAGA_AV = (window.NPSaga && window.NPSaga.map) || {};
  var SAGA_KEY = "np-saga",
    SAGA = (function () {
      var v = "";
      try {
        v = localStorage.getItem(SAGA_KEY) || "";
      } catch (e) {}
      // Solo sagas conocidas: nada de claves arbitrarias de localStorage.
      return typeof v === "string" && NP.has(SAGA_AV, v) ? v : "";
    })();
  function sagaList(k) {
    return window.NPSaga ? window.NPSaga.list(k) : [];
  }
  var needQuiz = FULL && !loggedIn && !!HP;
  var quizActive = !1,
    quizDone = !1,
    quizEl = ov.querySelector(".nsw-quiz"),
    pickedSaga = "";
  if (needQuiz) ov.classList.add("nsw-q-nosaga");
  function esc2(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }
  // Colores que van a un atributo style: solo hexadecimales.
  function hexColor(c) {
    return typeof c === "string" && /^#[0-9a-f]{3,8}$/i.test(c) ? c : "";
  }
  function colorVars(n1, c1, n2, c2) {
    var a = hexColor(c1),
      b = hexColor(c2);
    return (a ? ";" + n1 + ":" + a : "") + (b ? ";" + n2 + ":" + b : "");
  }
  function presetFor(k) {
    var tc = HP.tema && HP.tema[k];
    return (
      HP.presets.filter(function (x) {
        return x && x.id === tc;
      })[0] ||
      HP.presets[0] ||
      {}
    );
  }
  function syncAccent() {
    var rs = root.style,
      a1 = rs.getPropertyValue("--a1"),
      a2 = rs.getPropertyValue("--a2"),
      am = rs.getPropertyValue("--amid");
    if (a1) {
      ov.style.setProperty("--np-accent-1", a1);
      ov.style.setProperty("--npl-neon-cyan", a1);
    }
    if (a2) {
      ov.style.setProperty("--np-accent-2", a2);
      ov.style.setProperty("--npl-neon-red", a2);
    }
    if (am) ov.style.setProperty("--np-accent-mid", am);
  }
  function buildQuiz() {
    var F = HP.fondos,
      keys = Object.keys(F),
      h = "";
    h +=
      '<div class="nsw-q-step" data-step="1"><h2 class="nsw-q-title">¿Cuál es tu Universo Favorito?</h2><div class="nsw-q-sagas">';
    keys.forEach(function (k, i) {
      var pc = presetFor(k);
      h +=
        '<button type="button" class="nsw-q-saga" data-saga="' +
        esc2(k) +
        '" style="--i:' +
        i +
        colorVars("--c1", pc.c1, "--c2", pc.c2) +
        '"><span class="nsw-q-ic"><img loading="lazy" src="' +
        esc2(F[k].img) +
        '" alt="" width="84" height="84" decoding="async"></span>' +
        "<b>" +
        esc2(F[k].label) +
        "</b><small>" +
        esc2(F[k].sub || "") +
        "</small></button>";
    });
    h +=
      '</div></div><div class="nsw-q-step" data-step="2" hidden><h2 class="nsw-q-title">¿Cuál es tu Color Favorito?</h2><div class="nsw-q-colors">';
    HP.presets.forEach(function (c, i) {
      h +=
        '<button type="button" class="nsw-q-color" data-color="' +
        esc2(c.id) +
        '" style="--i:' +
        i +
        colorVars("--sw", c.c1, "--sw2", c.c2) +
        '" aria-label="Color ' +
        (i + 1) +
        '"></button>';
    });
    h += "</div></div>";
    quizEl.innerHTML = h;
  }
  function preloadQuiz() {
    if (!needQuiz || preloadQuiz.done) return;
    preloadQuiz.done = !0;
    Object.keys(HP.fondos).forEach(function (k) {
      var im = new Image();
      im.decoding = "async";
      im.src = HP.fondos[k].img;
    });
  }
  // Cualquier excepción al montar el test sale de la bienvenida (bail).
  function showQuiz() {
    try {
      showQuizRaw();
    } catch (e) {
      bail(e);
    }
  }
  function showQuizRaw() {
    if (quizActive || quizDone || done) return;
    quizActive = !0;
    lastProgress = Date.now();
    timers.forEach(clearTimeout);
    buildQuiz();
    var was = logoMove.getBoundingClientRect();
    ov.classList.add("nsw-p0", "nsw-p1", "nsw-q-prep", "nsw-q-nosaga");
    var box = logoBox.getBoundingClientRect();
    if (was.width && box.width) {
      logoMove.style.transition = "none";
      logoMove.style.setProperty(
        "--nsw-logo-dx",
        Math.round(was.left + was.width / 2 - (box.left + box.width / 2)) +
          "px",
      );
      logoMove.style.setProperty(
        "--nsw-logo-dy",
        Math.round(was.top + was.height / 2 - (box.top + box.height / 2)) +
          "px",
      );
      logoMove.style.setProperty(
        "--nsw-logo-s",
        (was.width / box.width).toFixed(4),
      );
    }
    void ov.offsetWidth;
    logoMove.style.transition = "";
    requestAnimationFrame(function () {
      ov.classList.add("nsw-q");
      ov.classList.remove("nsw-q-prep");
    });
    ov.setAttribute("aria-label", "¿Cuál es tu universo favorito?");
  }
  function quizStep(n) {
    var s1 = quizEl.querySelector('[data-step="1"]'),
      s2 = quizEl.querySelector('[data-step="2"]');
    s1.classList.add("is-leaving");
    setTimeout(
      function () {
        var before = logoBox.getBoundingClientRect().top;
        s1.hidden = !0;
        s2.hidden = !1;
        ov.setAttribute("aria-label", "¿Cuál es tu color favorito?");
        glideLogo(before - logoBox.getBoundingClientRect().top, 1.3);
      },
      still ? 0 : 400,
    );
  }
  function glideLogo(dy, secs) {
    if (still || Math.abs(dy) < 1) return;
    logoBox.style.transition = "none";
    logoBox.style.transform = "translate3d(0," + Math.round(dy) + "px,0)";
    void logoBox.offsetWidth;
    logoBox.style.transition =
      "transform " + secs + "s cubic-bezier(.45, 0, .2, 1)";
    logoBox.style.transform = "";
  }
  function pickSaga(k) {
    if (!NP.has(HP.fondos, k)) return;
    pickedSaga = SAGA = k;
    if (soundOn()) prepJingle(k);
    window.NPHomeBgHold = !1;
    try {
      localStorage.setItem(SAGA_KEY, k);
    } catch (e) {}
    var p = presetFor(k);
    HP.set({ video: k, accent: p.id, c1: p.c1, c2: p.c2 });
    ov.classList.remove("nsw-q-nosaga");
    syncAccent();
    [].forEach.call(quizEl.querySelectorAll(".nsw-q-saga"), function (b) {
      b.classList.toggle("is-on", b.getAttribute("data-saga") === k);
    });
    [].forEach.call(quizEl.querySelectorAll(".nsw-q-color"), function (b) {
      b.classList.toggle("is-on", b.getAttribute("data-color") === p.id);
    });
    Snd.tap(1);
    setTimeout(quizStep, still ? 0 : 520);
  }
  function pickColor(id) {
    var p = HP.presets.filter(function (x) {
      return x.id === id;
    })[0];
    if (!p) return;
    HP.set({ accent: p.id, c1: p.c1, c2: p.c2 });
    syncAccent();
    [].forEach.call(quizEl.querySelectorAll(".nsw-q-color"), function (b) {
      b.classList.toggle("is-on", b.getAttribute("data-color") === id);
    });
    Snd.tap(2);
    setTimeout(finishQuiz, still ? 0 : 600);
  }
  function finishQuiz() {
    if (!quizActive) return;
    quizActive = !1;
    quizDone = !0;
    lastProgress = Date.now();
    if (window.NPHomeBgHold) {
      window.NPHomeBgHold = !1;
      if (window.NPHomeBg) window.NPHomeBg.play();
    }
    try {
      localStorage.setItem(QUIZ_KEY, "1");
    } catch (e) {}
    Snd.reveal(!0);
    ov.classList.add("nsw-q-out");
    setTimeout(
      function () {
        var b = logoBox.getBoundingClientRect();
        ov.classList.add("nsw-q-done");
        ov.classList.remove("nsw-q", "nsw-q-out");
        var a = logoBox.getBoundingClientRect();
        var sc = a.width ? b.width / a.width : 1;
        logoBox.style.transformOrigin = "50% 0";
        logoBox.style.transition = "none";
        logoBox.style.transform =
          "translate3d(" +
          Math.round(b.left + b.width / 2 - (a.left + a.width / 2)) +
          "px," +
          Math.round(b.top - a.top) +
          "px,0) scale(" +
          sc.toFixed(3) +
          ")";
        void logoBox.offsetWidth;
        logoBox.style.transition =
          "transform 1.2s cubic-bezier(.22, 1, .36, 1)";
        logoBox.style.transform = "";
        ov.setAttribute(
          "aria-label",
          "Nintendo Project. Pulsa 3 veces para entrar.",
        );
        ov.classList.remove("nsw-q-nosaga");
        remeasure();
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            setPhase(2);
            timers.push(
              setTimeout(
                function () {
                  setPhase(3);
                },
                still ? 0 : 750,
              ),
            );
          });
        });
      },
      still ? 0 : 500,
    );
  }
  quizEl.addEventListener("click", function (e) {
    if (!quizActive) return;
    var t = e.target.closest("[data-saga], [data-color]");
    if (!t) return;
    gestured = !0;
    try {
      Snd.unlock();
      if (t.hasAttribute("data-saga")) pickSaga(t.getAttribute("data-saga"));
      else pickColor(t.getAttribute("data-color"));
    } catch (err) {
      bail(err);
    }
  });
  // Termina el test con respuestas por defecto (Saltar / Escape / fallo):
  // conserva lo que el usuario ya tuviera y, si no hay nada, usa el primer universo.
  function quizDefaults() {
    if (!needQuiz || quizDone) return;
    quizActive = !1;
    quizDone = !0;
    try {
      localStorage.setItem(QUIZ_KEY, "1");
    } catch (e) {}
    try {
      if (!pickedSaga) {
        var cur = (HP.get && HP.get()) || {};
        if (!(typeof cur.video === "string" && NP.has(HP.fondos, cur.video))) {
          var k = Object.keys(HP.fondos)[0];
          if (k) {
            var p = presetFor(k);
            HP.set({ video: k, accent: p.id, c1: p.c1, c2: p.c2 });
          }
        }
      }
      syncAccent();
    } catch (e) {}
    if (window.NPHomeBgHold) {
      window.NPHomeBgHold = !1;
      if (window.NPHomeBg) window.NPHomeBg.play();
    }
  }
  if (!needQuiz && !loggedIn && soundOn()) prepJingle(curUniverse());
  function startLogo() {
    setPhase(1);
    if (needQuiz && !quizDone) {
      preloadQuiz();
      timers.push(setTimeout(showQuiz, 1250));
      return;
    }
    timers.push(
      setTimeout(function () {
        setPhase(2);
      }, 1500),
    );
    timers.push(
      setTimeout(function () {
        setPhase(3);
      }, 2400),
    );
  }
  var AV_TROFEOS = window.NP_AV_TROFEOS || [];
  var AV_BASE = NP.u("wp-content/uploads/");
  function avUrl(folder, n) {
    return AV_BASE + folder + "/" + n + (n.indexOf(".") > -1 ? "" : ".webp");
  }
  function pickAvatars(count) {
    var sl = SAGA ? sagaList(SAGA) : [];
    if (sl.length) {
      for (var q = sl.length - 1; q > 0; q--) {
        var r = Math.floor(Math.random() * (q + 1)),
          tq = sl[q];
        sl[q] = sl[r];
        sl[r] = tq;
      }
      var rp = [];
      while (rp.length < count) rp = rp.concat(sl);
      return rp.slice(0, count);
    }
    var groups = [];
    AV_TROFEOS.forEach(function (tr) {
      groups.push({ folder: "2026/09", names: tr[2].split("|"), tr: tr });
    });
    var total = 0;
    groups.forEach(function (g) {
      total += g.names.length;
    });
    var chosen = {},
      out = [],
      guard = 0;
    while (out.length < count && guard++ < count * 20) {
      var k = Math.floor(Math.random() * total);
      if (chosen[k]) continue;
      chosen[k] = 1;
      for (var gi = 0, acc = 0; gi < groups.length; gi++) {
        var g = groups[gi];
        if (k < acc + g.names.length) {
          var n = g.names[k - acc];
          out.push({
            u: avUrl(g.folder, n),
            bg: "linear-gradient(135deg," + g.tr[0] + "," + g.tr[1] + ")",
            full: !0,
          });
          break;
        }
        acc += g.names.length;
      }
    }
    return out;
  }
  var intro = ov.querySelector(".nsw-intro");
  var introRaf = 0,
    introDone = !1,
    introCleanup = null;
  var shownAv = [],
    loadedAv = [];
  function stopIntro() {
    introDone = !0;
    if (introRaf) cancelAnimationFrame(introRaf);
    introRaf = 0;
    if (introCleanup) {
      introCleanup();
      introCleanup = null;
    }
    if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
  }
  function runIntro() {
    try {
      runIntroRaw();
    } catch (e) {
      bail(e);
    }
  }
  function runIntroRaw() {
    preloadQuiz();
    var track = intro.querySelector(".nsw-track");
    var slots = [],
      cursor = 0;
    function makeSlot() {
      var s = document.createElement("span");
      s.className = "nsw-slot";
      var im = document.createElement("img");
      im.alt = "";
      im.decoding = "async";
      s.appendChild(im);
      track.appendChild(s);
      var sl = { el: s, img: im, cycle: null, op: -1, z: -1, c: !1 };
      slots.push(sl);
      return sl;
    }
    var slotPx = makeSlot().el.offsetWidth || 120;
    var gap = slotPx * 1.24;
    var N = Math.max(
      5,
      Math.min(
        9,
        2 * Math.ceil((window.innerWidth / 2 + slotPx * 0.6) / gap) + 1,
      ),
    );
    while (slots.length < N) makeSlot();
    function measure() {
      slotPx = slots[0].el.offsetWidth || slotPx;
      gap = slotPx * 1.24;
    }
    window.addEventListener("resize", measure, { passive: !0 });
    introCleanup = function () {
      window.removeEventListener("resize", measure);
    };
    var PRELOAD = Math.min(32, N + (lowEnd ? 12 : 20));
    var loaded = loadedAv;
    pickAvatars(PRELOAD).forEach(function (a, idx) {
      var im = new Image();
      im.decoding = "async";
      if (idx >= N + 2)
        try {
          im.fetchPriority = "low";
        } catch (e) {}
      im.src = a.u;
      if (im.decode)
        im.decode().then(
          function () {
            loaded.push(a);
          },
          function () {},
        );
      else
        im.onload = function () {
          loaded.push(a);
        };
    });
    function fill(slot) {
      if (!loaded.length) return;
      var a = loaded[cursor % loaded.length];
      cursor++;
      if (shownAv.indexOf(a) === -1) shownAv.push(a);
      slot.el.style.backgroundImage = a.bg;
      slot.el.classList.toggle("is-full", a.full);
      slot.img.src = a.u;
    }
    var T = 2.7;
    var V0 = 1.4,
      V1 = 24;
    var K = Math.log(V1 / V0) / T;
    var offset = 0,
      last = 0,
      t0 = 0,
      lastTick = 0;
    function frame(now) {
      try {
        frameRaw(now);
      } catch (e) {
        bail(e);
      }
    }
    function frameRaw(now) {
      introRaf = 0;
      if (introDone) return;
      if (!t0) {
        t0 = now;
        last = now;
      }
      var t = (now - t0) / 1000;
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      var v = V0 * Math.exp(K * Math.min(t, T));
      offset += v * dt;
      if (Math.floor(offset) !== lastTick) {
        lastTick = Math.floor(offset);
        Snd.tick(v);
      }
      for (var i = 0; i < N; i++) {
        var sl = slots[i];
        var pos = i - offset;
        var cycle = Math.floor(pos / N);
        if (cycle !== sl.cycle) {
          sl.cycle = cycle;
          fill(sl);
        }
        var rel = pos - cycle * N - (N - 1) / 2;
        var d = rel < 0 ? -rel : rel;
        var sc = Math.max(0.48, 1.2 - d * 0.17);
        var op =
          Math.round(Math.max(0, Math.min(1, 1.25 - d * 0.26)) * 50) / 50;
        var z = 100 - Math.round(d * 10);
        sl.el.style.transform =
          "translate3d(" +
          (rel * gap).toFixed(1) +
          "px,0,0) scale(" +
          sc.toFixed(3) +
          ")";
        if (op !== sl.op) {
          sl.op = op;
          sl.el.style.opacity = op;
        }
        if (z !== sl.z) {
          sl.z = z;
          sl.el.style.zIndex = z;
        }
        var c = d < 0.5;
        if (c !== sl.c) {
          sl.c = c;
          sl.el.classList.toggle("is-center", c);
        }
      }
      if (t >= T) {
        finishIntro();
        return;
      }
      introRaf = requestAnimationFrame(frame);
    }
    function finishIntro() {
      if (introCleanup) {
        introCleanup();
        introCleanup = null;
      }
      useIntroAvatars();
      Snd.reveal();
      intro.classList.add("is-out");
      timers.push(setTimeout(startLogo, 180));
      timers.push(
        setTimeout(function () {
          introDone = !0;
          if (intro.parentNode) intro.parentNode.removeChild(intro);
        }, 1000),
      );
    }
    var waitStart = Date.now();
    (function waitLoad() {
      if (introDone) return;
      if (
        loaded.length >= Math.min(10, N + 2) ||
        (loaded.length >= 1 && Date.now() - waitStart > 1400)
      ) {
        slots.forEach(function (sl) {
          fill(sl);
        });
        ov.classList.add("nsw-p0");
        introRaf = requestAnimationFrame(frame);
      } else if (Date.now() - waitStart > 2600) {
        stopIntro();
        ov.classList.add("nsw-p0");
        startLogo();
      } else timers.push(setTimeout(waitLoad, 80));
    })();
  }
  var bigTimer = 0,
    bigUsed = !1;
  function useIntroAvatars() {
    if (bigUsed || (needQuiz && !quizDone)) return;
    var list = (shownAv.length >= 3 ? shownAv : loadedAv).slice(0, 16);
    if (SAGA && SAGA_AV[SAGA]) {
      var seen = {};
      list = sagaList(SAGA)
        .filter(function (a) {
          if (seen[a.u]) return !1;
          seen[a.u] = 1;
          return !0;
        })
        .slice(0, 16);
    }
    if (list.length >= 1) {
      try {
        window.NP_INTRO_AV = list;
        localStorage.setItem("np-intro-av", JSON.stringify(list.slice(0, 12)));
      } catch (e) {}
    }
    if (loggedIn) return;
    if (!list.length) list = pickAvatars(10);
    if (!list.length) return;
    bigUsed = !0;
    var frag = document.createDocumentFragment();
    var items = list.map(function (a) {
      var s = document.createElement("span");
      s.className = "nsw-big" + (a.full ? " is-full" : "");
      s.style.backgroundImage = a.bg;
      var im = document.createElement("img");
      im.src = a.u;
      im.alt = "";
      im.decoding = "async";
      s.appendChild(im);
      frag.insertBefore(s, frag.firstChild);
      return s;
    });
    avCircle.insertBefore(frag, avCircle.firstChild);
    var cur = 0;
    items[0].classList.add("on");
    if (items.length < 2) return;
    bigTimer = setInterval(function () {
      if (document.hidden) return;
      var prev = items[cur];
      prev.classList.remove("on");
      prev.classList.add("off");
      setTimeout(function () {
        prev.classList.remove("off");
      }, 450);
      cur = (cur + 1) % items.length;
      items[cur].classList.remove("off");
      items[cur].classList.add("on");
    }, 2000);
  }
  function skipIntro() {
    if (ready) return;
    timers.forEach(clearTimeout);
    if (!introDone && intro) Snd.reveal(!0);
    stopIntro();
    useIntroAvatars();
    ov.classList.add("nsw-skip", "nsw-p0");
    if (needQuiz && !quizDone) {
      setPhase(1);
      showQuiz();
      return;
    }
    setPhase(3);
  }
  var count = 0,
    done = !1,
    hapticTimer = 0;
  var pill = ov.querySelector(".ns-lock-pill");
  var dots = ov.querySelectorAll(".ns-lock-dot");
  function pillFx() {
    pill.style.setProperty("--npl-progress", String(count / 3));
    if (avatarEl) {
      avatarEl.classList.add("sink");
      setTimeout(function () {
        avatarEl.classList.remove("sink");
      }, 140);
    }
    if (still) {
      if (count === 3) pill.classList.add("np-unlocked");
      return;
    }
    var pr = document.createElement("span");
    pr.className = "npl-ripple";
    pill.appendChild(pr);
    setTimeout(function () {
      if (pr.parentNode) pr.parentNode.removeChild(pr);
    }, 600);
    pill.classList.remove("np-haptic");
    void pill.offsetWidth;
    pill.classList.add("np-haptic");
    clearTimeout(hapticTimer);
    hapticTimer = setTimeout(function () {
      pill.classList.remove("np-haptic");
    }, 300);
    if (count === 3) {
      pill.classList.add("np-unlocked");
      var sw = document.createElement("span");
      sw.className = "npl-sweep";
      pill.appendChild(sw);
    }
  }
  function startHomeMusic() {
    if (typeof window.npHomeMusicStart === "function")
      window.npHomeMusicStart();
  }
  function press() {
    gestured = !0;
    if (jingleWait && ready) {
      jingleWait = !1;
      playJingle();
    }
    if (done || quizActive) return;
    Snd.unlock();
    if (intro && !introDone) return;
    if (!ready) {
      skipIntro();
      return;
    }
    playVid();
    count++;
    Snd.tap(count);
    for (var i = 0; i < dots.length; i++)
      dots[i].classList.toggle("filled", i < count);
    pillFx();
    if (count >= 3) {
      startHomeMusic();
      enter();
    }
  }
  function isTp(e) {
    var x = e.target;
    if (!x || !x.closest) return !1;
    if (x.closest(".nsw-quiz, .np-btn-saltar")) return !0;
    return ov.classList.contains("nsw-tp-ready") && !!x.closest(".nsw-tp");
  }
  var sx = 0,
    sy = 0,
    st = 0,
    moved = !1,
    lastTouch = 0;
  ov.addEventListener(
    "touchstart",
    function (e) {
      if (isTp(e)) {
        moved = !0;
        return;
      }
      var t = e.touches && e.touches[0];
      if (!t || e.touches.length > 1) {
        moved = !0;
        return;
      }
      sx = t.clientX;
      sy = t.clientY;
      st = Date.now();
      moved = !1;
    },
    { passive: !0 },
  );
  ov.addEventListener(
    "touchmove",
    function (e) {
      var t = e.touches && e.touches[0];
      if (!t) return;
      if (Math.abs(t.clientX - sx) > 12 || Math.abs(t.clientY - sy) > 12)
        moved = !0;
    },
    { passive: !0 },
  );
  ov.addEventListener(
    "touchend",
    function (e) {
      if (isTp(e)) return;
      if (moved || Date.now() - st > 600) return;
      if (e.cancelable) e.preventDefault();
      lastTouch = Date.now();
      press();
    },
    { passive: !1 },
  );
  ov.addEventListener("click", function (e) {
    if (isTp(e)) return;
    if (Date.now() - lastTouch < 700) return;
    e.preventDefault();
    press();
  });
  ov.addEventListener("keydown", function (e) {
    if (isTp(e)) return;
    if (e.key === "Enter" || e.key === " " || e.key === "a" || e.key === "A") {
      e.preventDefault();
      press();
    }
  });
  ov.addEventListener(
    "wheel",
    function (e) {
      e.preventDefault();
    },
    { passive: !1 },
  );
  ov.addEventListener("contextmenu", function (e) {
    if (!isTp(e)) e.preventDefault();
  });
  function dropMenu() {
    var nav = document.getElementById("np-nav");
    html.classList.remove("nsw-on");
    if (!nav || still) return;
    var items = nav.querySelectorAll(
      "#menu-main-menu > li, .nav-right-part > *",
    );
    for (var i = 0; i < items.length; i++)
      items[i].style.setProperty("--nsw-i", String(Math.min(i, 12)));
    void nav.offsetWidth;
    html.classList.add("nsw-nav-drop");
    setTimeout(function () {
      html.classList.remove("nsw-nav-drop");
      for (var j = 0; j < items.length; j++)
        items[j].style.removeProperty("--nsw-i");
    }, 2000);
  }
  function enter() {
    if (done) return;
    done = !0;
    html.classList.remove("nsw-cover");
    try {
      window.scrollTo(0, 0);
    } catch (e) {}
    try {
      window.dispatchEvent(new Event("np-welcome-done"));
    } catch (e) {}
    setTimeout(
      function () {
        ov.classList.add("nsw-exit");
        setTimeout(dropMenu, still ? 0 : 240);
      },
      still ? 0 : 320,
    );
    setTimeout(finish, still ? 300 : 1050);
  }
  // Salida directa (botón "Saltar", Escape): nunca entra en bucles. Si el
  // test está pendiente o en curso se completa con respuestas por defecto.
  function skipAll() {
    if (done) return;
    gestured = !0;
    try {
      quizDefaults();
    } catch (e) {}
    try {
      timers.forEach(clearTimeout);
      stopIntro();
    } catch (e) {}
    startHomeMusic();
    enter();
  }
  var skipBtn = ov.querySelector(".np-btn-saltar");
  skipBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    skipAll();
  });
  function onEsc(e) {
    if (e.key !== "Escape" && e.key !== "Esc") return;
    if (done || !ov.parentNode) return;
    e.preventDefault();
    skipAll();
  }
  function sendClosed() {
    if (closedSent) return;
    closedSent = !0;
    try {
      window.dispatchEvent(new Event("np-welcome-closed"));
    } catch (e) {}
  }
  function finish() {
    if (finished) return;
    finished = !0;
    clearTimeout(safetyTimer);
    clearTimeout(hapticTimer);
    clearInterval(bigTimer);
    timers.forEach(clearTimeout);
    stopIntro();
    if (measureRaf) cancelAnimationFrame(measureRaf);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("keydown", onEsc);
    if (bgHost && bgParent)
      bgParent.insertBefore(
        bgHost,
        bgNext && bgNext.parentNode === bgParent ? bgNext : bgParent.firstChild,
      );
    if (vid) {
      try {
        var pp = vid.play();
        if (pp && pp.catch) pp.catch(function () {});
      } catch (e) {}
    }
    if (window.NPHomeBg) window.NPHomeBg.play();
    if (ov.parentNode) ov.parentNode.removeChild(ov);
    html.classList.remove("nsw-on", "nsw-cover");
    sendClosed();
    setTimeout(Snd.close, 1500);
  }
  // Último recurso: quita la capa y nsw-cover pase lo que pase.
  function hardExit() {
    finished = !0;
    clearTimeout(safetyTimer);
    window.NPHomeBgHold = !1;
    html.classList.remove("nsw-on", "nsw-cover");
    try {
      if (bgHost && bgParent && bgHost.parentNode !== bgParent)
        bgParent.insertBefore(bgHost, bgParent.firstChild);
    } catch (e) {}
    try {
      if (ov.parentNode) ov.parentNode.removeChild(ov);
    } catch (e) {}
    document.removeEventListener("keydown", onEsc);
    sendClosed();
  }
  // Cualquier excepción o bloqueo: completa el test por defecto y entra.
  function bail(err) {
    if (err && window.console) console.error("[NP:bienvenida]", err);
    if (bailed || finished) return;
    bailed = !0;
    try {
      quizDefaults();
    } catch (e) {}
    try {
      if (!done) enter();
    } catch (e) {}
    setTimeout(function () {
      if (finished) return;
      try {
        finish();
      } catch (e) {}
      hardExit();
    }, 1500);
  }
  // Vigilante: si 15 s después de empezar la intro no es interactiva
  // (ni pulsable ni en el test) y no avanza, se sale.
  function watchdog() {
    if (done || finished) return;
    if (!ready && !quizActive && Date.now() - lastProgress > 4000) {
      bail(new Error("intro bloqueada"));
      return;
    }
    safetyTimer = setTimeout(watchdog, 3000);
  }
  function begin() {
    if (done) return;
    if (still) {
      if (needQuiz) {
        setPhase(1);
        showQuiz();
      } else setPhase(3);
    } else if (intro) runIntro();
    else startLogo();
  }
  // Todo lo anterior ya se ha construido sin errores: ahora se monta la capa.
  function mount() {
    lastProgress = Date.now();
    document.addEventListener("keydown", onEsc);
    if (bgHost) bg.appendChild(bgHost);
    document.body.appendChild(ov);
    html.classList.add("nsw-on", "nsw-cover");
    safetyTimer = setTimeout(watchdog, 15000);
    try {
      window.scrollTo(0, 0);
    } catch (e) {}
    playVid();
    try {
      ov.focus({ preventScroll: !0 });
    } catch (e) {}
    requestAnimationFrame(function () {
      try {
        syncWidth();
        centerLogo();
      } catch (e) {
        bail(e);
        return;
      }
      requestAnimationFrame(function () {
        if (done) return;
        markSeen();
        try {
          begin();
        } catch (e) {
          bail(e);
        }
      });
    });
  }
  try {
    mount();
  } catch (e) {
    bail(e);
  }
})();
