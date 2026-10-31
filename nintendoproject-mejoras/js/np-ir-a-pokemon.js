(function () {
  if (window.NPGoPokemon) return;
  var HASH = "#mi-pokemon";
  var TARGET = "pkw";
  var OFFSET = 16;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var anim = 0,
    cancelled = !1;
  function target() {
    var el = document.getElementById(TARGET);
    return el ? el.closest(".pkw-wrapper") || el : null;
  }
  function destY(el) {
    var max = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    var y = el.getBoundingClientRect().top + window.pageYOffset - OFFSET;
    return Math.max(0, Math.min(max, y));
  }
  function jump(y) {
    try {
      window.scrollTo({ top: y, left: 0, behavior: "instant" });
    } catch (e) {
      window.scrollTo(0, y);
    }
  }
  function ease(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function stopAnim() {
    if (anim) cancelAnimationFrame(anim);
    anim = 0;
  }
  function scrollToWidget() {
    var el = target();
    if (!el) return !1;
    stopAnim();
    cancelled = !1;
    var start = window.pageYOffset;
    var dist = Math.abs(destY(el) - start);
    if (reduced.matches || dist < 2) {
      jump(destY(el));
      return !0;
    }
    var dur = Math.min(1100, Math.max(450, dist * 0.45));
    var t0 = performance.now();
    function frame(now) {
      if (cancelled) {
        anim = 0;
        return;
      }
      var p = Math.min(1, (now - t0) / dur);
      var to = destY(el);
      jump(Math.round(start + (to - start) * ease(p)));
      if (p < 1) anim = requestAnimationFrame(frame);
      else anim = 0;
    }
    anim = requestAnimationFrame(frame);
    return !0;
  }
  function userStop() {
    cancelled = !0;
    stopAnim();
  }
  ["wheel", "touchstart", "keydown"].forEach(function (t) {
    window.addEventListener(t, userStop, { passive: !0 });
  });
  function isPokemonLink(a) {
    var href = a && a.getAttribute("href");
    return !!href && href.indexOf(HASH) !== -1;
  }
  function samePage(a) {
    try {
      var u = new URL(a.href, location.href);
      return (
        u.origin === location.origin &&
        u.pathname.replace(/\/+$/, "") === location.pathname.replace(/\/+$/, "")
      );
    } catch (e) {
      return !1;
    }
  }
  function closeMobileMenu() {
    var menu = document.getElementById("sidebar-menu");
    if (!menu || !menu.classList.contains("show_menu")) return !1;
    var btn = menu.querySelector(".close_button button.close, button.close");
    if (btn) btn.click();
    else menu.classList.remove("show_menu");
    return !0;
  }
  document.addEventListener("click", function (e) {
    var a = e.target instanceof Element ? e.target.closest("a[href]") : null;
    if (!isPokemonLink(a) || !samePage(a) || !target()) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    e.preventDefault();
    var wasOpen = closeMobileMenu();
    setTimeout(scrollToWidget, wasOpen ? 450 : 0);
  });
  if (location.hash !== HASH) return;
  window.NPGoPokemon = !0;
  try {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  } catch (e) {}
  function go() {
    if (!cancelled) scrollToWidget();
  }
  function ready() {
    var fonts =
      document.fonts && document.fonts.ready
        ? document.fonts.ready
        : Promise.resolve();
    fonts.then(
      function () {
        setTimeout(go, 200);
      },
      function () {
        setTimeout(go, 200);
      },
    );
  }
  if (document.readyState === "complete") ready();
  else window.addEventListener("load", ready, { once: !0 });
})();
