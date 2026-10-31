(function () {
  if (window.NPMobileHeader) return;
  window.NPMobileHeader = !0;
  var mobile = window.matchMedia("(max-width: 768px)");
  var introDone = !1;
  function intro() {
    if (introDone) return;
    introDone = !0;
    var nav = document.getElementById("np-nav");
    if (!nav || !nav.classList.contains("np-mintro")) return;
    try {
      window.sessionStorage.setItem("np-menu-intro:m1", "1");
    } catch (e) {}
    var items = Array.prototype.filter
      .call(nav.querySelectorAll(".nav-right-part > *"), function (el) {
        return el.getClientRects().length > 0;
      })
      .sort(function (a, b) {
        return a.getBoundingClientRect().left - b.getBoundingClientRect().left;
      });
    var tab = nav.querySelector(
      ".container.custom-container > .np-menu-palette-btn",
    );
    if (tab) items.push(tab);
    items.forEach(function (el, i) {
      el.style.setProperty("--np-md", i * 70 + "ms");
    });
    void nav.offsetWidth;
    nav.classList.remove("np-mintro");
    nav.classList.add("np-mintro-run");
    setTimeout(
      function () {
        nav.classList.remove("np-mintro-run");
        items.forEach(function (el) {
          el.style.removeProperty("--np-md");
        });
        schedule();
      },
      70 * items.length + 750,
    );
  }
  if (document.readyState === "complete") intro();
  else window.addEventListener("load", intro, { once: !0 });
  setTimeout(intro, 6000);
  var frame = 0;
  function balance() {
    frame = 0;
    var nav = document.getElementById("np-nav");
    var av = nav && nav.querySelector(".nav-right-part .np-mobile-avatar");
    if (!av) return;
    if (!mobile.matches) {
      av.style.removeProperty("translate");
      var pk = nav.querySelector(".nav-right-part > a.np-desktop-pokemon-card");
      if (pk) pk.style.removeProperty("translate");
      return;
    }
    var art =
      nav.querySelector(".np-bar-art") ||
      nav.querySelector(".container.custom-container");
    av.style.setProperty("translate", "0 0px", "important");
    var a = art.getBoundingClientRect(),
      r = av.getBoundingClientRect();
    var ty = 0,
      tf = getComputedStyle(av).transform;
    if (tf && tf !== "none") {
      try {
        ty = new DOMMatrixReadOnly(tf).m42;
      } catch (e) {}
    }
    var rTop = r.top - ty,
      rBottom = r.bottom - ty;
    var badge = av.querySelector(".np-badge");
    var badgeTop = badge ? rTop + Math.min(0, badge.offsetTop) : rTop;
    var spaceTop = badgeTop - a.top;
    var spaceBottom = a.bottom - rBottom;
    var MIN = document.body.classList.contains("logged-in") ? 7 : 4;
    var each = (spaceTop + spaceBottom) / 2;
    var fitted = nav.style.getPropertyValue("--np-ma");
    if (each < MIN - 0.5) {
      var size = Math.floor(av.offsetWidth - 2 * (MIN - each));
      nav.style.setProperty("--np-ma", Math.max(32, size) + "px");
      schedule();
      return;
    }
    if (fitted && each > MIN + 3) {
      nav.style.removeProperty("--np-ma");
      schedule();
      return;
    }
    var shift = (spaceBottom - spaceTop) / 2;
    av.style.setProperty(
      "translate",
      "0 " + shift.toFixed(1) + "px",
      "important",
    );
    var poke = nav.querySelector(".nav-right-part > a.np-desktop-pokemon-card");
    if (poke) {
      if (poke.getClientRects().length)
        poke.style.setProperty(
          "translate",
          "0 " + shift.toFixed(1) + "px",
          "important",
        );
      else poke.style.removeProperty("translate");
    }
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(balance);
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", schedule);
  else schedule();
  window.addEventListener("load", schedule);
  window.addEventListener("resize", schedule);
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(schedule);
  if (mobile.addEventListener) mobile.addEventListener("change", schedule);
  else mobile.addListener(schedule);
})();
